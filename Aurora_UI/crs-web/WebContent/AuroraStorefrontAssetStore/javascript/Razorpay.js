//-----------------------------------------------------------------
//  Licensed Materials - Property of HCL Technologies                 
//
// HCL Commerce
//
//  (C) Copyright HCL Technologies Limited 1996, 2020                 
//
//-----------------------------------------------------------------

/**
	 * This service submits the order. Upon success, the order billing confirmation
	 * page is shown. A error message is displayed otherwise.
	 * @constructor
	 */
	wcService.declare({
		id: "AjaxCreateRazorPayOrder",
		actionId: "AjaxCreateRazorPayOrder",
		url: getAbsoluteURL() + "AjaxRazorPayCreateOrder",
		formId: ""

	/**
	 *redirect to the Order Confirmation page
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation
	 */
		,successHandler: function(serviceResponse) {
			if(serviceResponse != undefined && serviceResponse.razorPayOrderId != undefined && serviceResponse.key != undefined)
			{
				options.storeId = serviceResponse.storeId;
				options.langId = serviceResponse.langId;
				options.catalogId = serviceResponse.catalogId;
				options.orderId = serviceResponse.orderId;
				options.key = serviceResponse.key;
				options.amount = serviceResponse.razorPayAmount;
				options.currency = serviceResponse.razorPayCurrency;
				options.order_id = serviceResponse.razorPayOrderId;
				
				var rzp1 = new Razorpay(options);
				
				rzp1.on('payment.failed', function (response){
					//rzp1.close();
					var razorPayErrorMessage = 'true';
					document.location.href = appendWcCommonRequestParameters("OrderShippingBillingView?storeId=" + ServicesDeclarationJS.storeId + "&catalogId=" + ServicesDeclarationJS.catalogId + "&langId=" + ServicesDeclarationJS.langId+'&razorPayErrorMessage='+razorPayErrorMessage);
					
					cursor_clear();
				    
				    // window.history.back();
				}); 
				
				rzp1.open();
			
			} 
			return;
		}

	/**
	 * display an error message
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation
	 */
		,failureHandler: function(serviceResponse) {

			if (serviceResponse.errorMessage) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
			}
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			cursor_clear();
		}

	}),

	/**
	 * This service submits the order. Upon success, the order billing confirmation
	 * page is shown. A error message is displayed otherwise.
	 * @constructor
	 */
	wcService.declare({
		id: "AjaxRazorPayProcessPaymentAndOrder",
		actionId: "AjaxRazorPayProcessPaymentAndOrder",
		url: getAbsoluteURL() + "AjaxRazorPayProcessPaymentAndOrder",
		formId: ""

	/**
	 *redirect to the Order Confirmation page
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation
	 */
		,successHandler: function(serviceResponse) {
			cursor_clear();
			nullCartTotalCookie(serviceResponse.orderId);
			var shipmentTypeId = CheckoutHelperJS.getShipmentTypeId();
			document.location.href = appendWcCommonRequestParameters("OrderShippingBillingConfirmationView?storeId=" + ServicesDeclarationJS.storeId + "&catalogId=" + ServicesDeclarationJS.catalogId + "&langId=" + ServicesDeclarationJS.langId + "&orderId=" + serviceResponse.orderId + "&shipmentTypeId=" + shipmentTypeId);
		}

	/**
	 * display an error message
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation
	 */
		,failureHandler: function(serviceResponse) {

			if (serviceResponse.errorMessage) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
			}
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			cursor_clear();
		}

	})

var options = {
    "key": "", // Enter the Key ID generated from the Dashboard
    "amount": "", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "",
    "order_id": "", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "storeId":"",
    "catalogId":"",
    "langId":"",
    "orderId":"",
    "piId":"",
    "payMethodId":"",
    "handler": function (response){
        
        var paymentParams = {};
        paymentParams.piId = options.piId;
        paymentParams.payMethodId = options.payMethodId;
        paymentParams.storeId = options.storeId;
        paymentParams.catalogId = options.catalogId;
        paymentParams.langId = options.langId;
        paymentParams.orderId = options.orderId;
        paymentParams.piAmount = options.amount;
        
        if(response != null){
			paymentParams.razorPaymentId = response.razorpay_payment_id;
	        paymentParams.razorPayOrderId = response.razorpay_order_id;
	        paymentParams.razorPaymentSignature = response.razorpay_signature; 
	        paymentParams.orderId = options.orderId;
	        paymentParams.action = "processPaymentAndOrder";       
        }
        
        paymentParams = CheckoutPayments.updateParamObject(paymentParams,"requesttype","ajax",true);
        wcService.invoke('AjaxRazorPayProcessPaymentAndOrder',paymentParams);
    },
    "modal": {
    "ondismiss": function(){
         cursor_clear();
		 MessageHelper.displayErrorMessage("Payment can not be completed. Please try again.");
     }, 
     "onpaymenterror":function(){
     },
     "onhidden":function(){
         cursor_clear();
     }
	},
    "prefill": {
        "name": ""
    },
    "notes": {
        "address": ""
    },
    "theme": {
        "color": "#3399cc"
    }
};
