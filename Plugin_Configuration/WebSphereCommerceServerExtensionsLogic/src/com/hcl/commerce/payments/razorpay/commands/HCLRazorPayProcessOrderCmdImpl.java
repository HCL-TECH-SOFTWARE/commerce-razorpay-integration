/*
Copyright [2022] [HCL America, Inc.]

 

Licensed under the Apache License, Version 2.0 (the "License");

you may not use this file except in compliance with the License.

You may obtain a copy of the License at

 

    http://www.apache.org/licenses/LICENSE-2.0

 

Unless required by applicable law or agreed to in writing, software

distributed under the License is distributed on an "AS IS" BASIS,

WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

See the License for the specific language governing permissions and

limitations under the License.
*/
package com.hcl.commerce.payments.razorpay.commands;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.commerce.beans.DataBeanManager;
import com.ibm.commerce.command.CommandContext;
import com.ibm.commerce.command.CommandFactory;
import com.ibm.commerce.command.ControllerCommandImpl;
import com.ibm.commerce.datatype.TypedProperty;
import com.ibm.commerce.edp.commands.PIEditCmd;
import com.ibm.commerce.exception.ECException;
import com.ibm.commerce.foundation.internal.server.services.registry.StoreConfigurationRegistry;
import com.ibm.commerce.foundation.logging.LoggingHelper;
import com.ibm.commerce.order.beans.OrderDataBean;
import com.ibm.commerce.order.beans.OrderDataBean.PaymentInstruction;
import com.ibm.commerce.order.commands.OrderProcessCmd;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

public class HCLRazorPayProcessOrderCmdImpl extends ControllerCommandImpl implements HCLRazorPayProcessOrderCmd {
	
	private static final String CLASS_NAME = "HCLRazorPayProcessOrderCmdImpl";
	private static final Logger LOGGER = Logger.getLogger(CLASS_NAME);
	
	private static String KEY;
	private static String SECRET;
	
	private static final String RAZORPAY_CREATE_ORDER = "createOrder";
	private static final String RAZORPAY_PROCESS_PAYMENT_AND_ORDER = "processPaymentAndOrder";
	
	private static final String RAZORPAY_ORDER_ID_TEXT = "razorPayOrderId";
	private static final String RAZORPAY_PAYMENT_ID = "razorPaymentId";
	private static final String RAZORPAY_PAYMENT_SIGNATURE = "razorPaymentSignature";
	
	private String action;
	private String orderId;
	
	private String razorPayOrderId;
	private String razorPaymentId;
	private String razorPaymentSignature;
	
	private Long[] piIds;
	private String paymentMethod;
	private OrderDataBean ordBean;
	
	TypedProperty respProperty = new TypedProperty();
	
	public OrderDataBean getOrdBean() {
		return ordBean;
	}

	public void setOrdBean(OrderDataBean ordBean) {
		this.ordBean = ordBean;
	}

	public HCLRazorPayProcessOrderCmdImpl() {
		KEY = StoreConfigurationRegistry.getSingleton().getValue(0, "RAZORPAY_KEY");
		SECRET = StoreConfigurationRegistry.getSingleton().getValue(0, "RAZORPAY_SECRET");
	}
	@Override
	public void setRequestProperties(TypedProperty reqProperties) throws ECException {
		final String METHOD_NAME = "setRequestProperties";
		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER)) {
			LOGGER.entering(CLASS_NAME, METHOD_NAME);
		}
		
		super.setRequestProperties(reqProperties);
		
		action = reqProperties.getString("action",null);
		orderId = reqProperties.getString("orderId",null);
		
		razorPayOrderId = reqProperties.getString(RAZORPAY_ORDER_ID_TEXT,null);
		razorPaymentId = reqProperties.getString(RAZORPAY_PAYMENT_ID,null);
		razorPaymentSignature = reqProperties.getString(RAZORPAY_PAYMENT_SIGNATURE,null);
	}
	
	@Override
	public void performExecute() throws ECException {
		final String METHOD_NAME = "performExecute";
		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER)) {
			LOGGER.entering(CLASS_NAME, METHOD_NAME);
		}
		
		super.performExecute();
		
		if(orderId != null){
			OrderDataBean ordDataBean = new OrderDataBean();
        	ordDataBean.setOrderId(orderId);
        	
			DataBeanManager.activate(ordDataBean, getCommandContext());
			setOrdBean(ordDataBean);
			
			if(action != null && action.equals(RAZORPAY_CREATE_ORDER)){
				createAndProcessRazorPayOrder();
			}else if(action != null && action.equals(RAZORPAY_PROCESS_PAYMENT_AND_ORDER)){
				findPaymentDetailsForOrder();
				updatePaymentInstructions();
				orderProcess();
			}
			super.setResponseProperties(respProperty);
		}
	}
	
	private void orderProcess() throws ECException {
        String methodName = "orderProcess";
        LOGGER.entering(CLASS_NAME, methodName);
        
        CommandContext commandContext = getCommandContext();
        TypedProperty reqProp = commandContext.getRequestProperties();
        
        OrderProcessCmd orderProcessCmd = (OrderProcessCmd)CommandFactory.createCommand(OrderProcessCmd.NAME, getStoreId());
		orderProcessCmd.setCommandContext(getCommandContext());
		orderProcessCmd.setRequestProperties(reqProp);
		orderProcessCmd.execute();
		
        LOGGER.exiting(CLASS_NAME, methodName);
	}
       
	/**
     * Update payment instructions
     * 
     * @throws ECException
     */
    private void updatePaymentInstructions() throws ECException {
        String methodName = "updatePaymentInstructions";
        LOGGER.entering(CLASS_NAME, methodName);
        CommandContext commandContext = getCommandContext();
        TypedProperty reqProp = new TypedProperty();
        
        PaymentInstruction paymentInstArr[] = getOrdBean().getPaymentInstructions();
        
        piIds = new Long[paymentInstArr.length];
        
        for (int i = 0; i < paymentInstArr.length; i++) {
        	String piId = paymentInstArr[i].getPaymentInstruction().getIdAsString();
        	String policyId = paymentInstArr[i].getPaymentInstruction().getPolicyId().toString();
        	
        	HashMap protocolDataMap = paymentInstArr[i].getPaymentInstruction().getProtocolData();
        	
        	if(protocolDataMap != null){
	        	Iterator it = protocolDataMap.entrySet().iterator();
	            while (it.hasNext()) {
	                Map.Entry entry = (Map.Entry)it.next();
	                
	                reqProp.put(entry.getKey().toString(), entry.getValue().toString());
	                it.remove(); // avoids a ConcurrentModificationException
	            }
        	}
            
            
        	reqProp.put("piAmount", getOrdBean().getGrandTotal().getAmount().toString());
    		//reqProp.put("policyId", policyId);
    		
        	PIEditCmd piEditCmd = (PIEditCmd) CommandFactory.createCommand(PIEditCmd.class.getName(), getStoreId());
            reqProp.put("storeId", getStoreId());
            
            if(razorPayOrderId != null){
            	reqProp.put(RAZORPAY_ORDER_ID_TEXT, razorPayOrderId);
            }
            if(razorPaymentSignature != null){
            	reqProp.put(RAZORPAY_PAYMENT_SIGNATURE, razorPaymentSignature);
            }
            if(razorPaymentId != null){
            	reqProp.put(RAZORPAY_PAYMENT_ID, razorPaymentId);
            }
            
            reqProp.put("orderId", Long.valueOf(orderId));
            reqProp.put("piId", piId);
            reqProp.put("policyId", policyId);
            reqProp.put("URL", " ");
            
            LOGGER.logp(Level.FINE, CLASS_NAME, methodName, "Request properties for updating Payment Instruction: " + reqProp);
            commandContext.setStoreId(getStoreId());
            piEditCmd.setOrderId(Long.valueOf(orderId));
            piEditCmd.setCommandContext(getCommandContext());
            piEditCmd.setRequestProperties(reqProp);
            try{
            	piEditCmd.execute();
            }catch(Exception e){
            	e.printStackTrace();
            }
        }
        
        LOGGER.exiting(CLASS_NAME, methodName);
    }
	
	private void createAndProcessRazorPayOrder(){
		
		final String METHOD_NAME = "createAndProcessRazorPayOrder";
		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER)) {
			LOGGER.entering(CLASS_NAME, METHOD_NAME);
		}
		
		Order rzOrder = createRazorPayOrder();
		
		if(rzOrder != null){
			StoreConfigurationRegistry storeconfReg = StoreConfigurationRegistry.getSingleton();
			
			if(rzOrder.get("id") != null){
				respProperty.put("razorPayOrderId", rzOrder.get("id"));
			}
			
			if(rzOrder.get("amount") != null){
				Integer rzAmount = (Integer)rzOrder.get("amount");
				double rzAmountDouble = (double)rzAmount/100;
				respProperty.put("razorPayAmount", rzOrder.get("amount"));
			}
			
			if(rzOrder.get("currency") != null){
				respProperty.put("razorPayCurrency", rzOrder.get("currency"));
			}
			
			if(rzOrder.get("amount_paid") != null){
				respProperty.put("razorPayAmountPaid", rzOrder.get("amount_paid"));
			}

			respProperty.put("key", KEY);
		}
		else{
			respProperty.put("Error", "There is some issue at connecting with Razorpay.");
		}

		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER)) {
			LOGGER.exiting(CLASS_NAME, METHOD_NAME);
		}
	}
	
	private void findPaymentDetailsForOrder() throws ECException {
        String methodName = "findPaymentDetailsForOrder";
        LOGGER.entering(CLASS_NAME, methodName);
        
        PaymentInstruction paymentInstArr[] = getOrdBean().getPaymentInstructions();
        
        piIds = new Long[paymentInstArr.length];
        
        for (int i = 0; i < paymentInstArr.length; i++) {
        	piIds[i] = paymentInstArr[i].getPaymentInstruction().getId();
        }
        LOGGER.exiting(CLASS_NAME, methodName);
    }
	
	private Order createRazorPayOrder(){
		String METHODNAME = "createRazorPayOrder";
		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER)) {
			LOGGER.entering(CLASS_NAME, METHODNAME);
		}
		
		Order rzOrder = null;
	try{
		  String secretKey = "";
		  
		  RazorpayClient razorPayClient = new RazorpayClient(KEY, SECRET);
		  org.json.JSONObject orderRequest = new org.json.JSONObject();
		  BigDecimal orderTotal = getOrdBean().getGrandTotal().getAmount();
		  orderRequest.put("amount", orderTotal.doubleValue()*100); // amount in the smallest currency unit
		  orderRequest.put("currency", getOrdBean().getCurrency());
		  if(getOrdBean().getBillingAddressDataBean() != null && getOrdBean().getBillingAddressDataBean().getEmail1() != null){
			  orderRequest.put("receipt", getOrdBean().getBillingAddressDataBean().getEmail1());
		  }
		  rzOrder = razorPayClient.Orders.create(orderRequest);
		} catch (RazorpayException e) {
		  System.out.println(e.getMessage());
		}
	
		return rzOrder;
	}
}
