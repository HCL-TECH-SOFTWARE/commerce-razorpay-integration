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

package com.hcl.commerce.payments.razorpay.handler;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.ibm.commerce.datatype.TypedProperty;
import com.ibm.commerce.rest.classic.core.AbstractConfigBasedClassicHandler;
import com.ibm.commerce.rest.javadoc.ResponseSchema;

@Path("store/{storeId}/razorpay")
public class HCLRazorPayRestHandler extends AbstractConfigBasedClassicHandler {

	private static final String RESOURCE_NAME = "razorpay";
	private static final String RAZORPAY_HEADER_DETAILS ="generateheader";
	private static final String RAZORPAY_CREATE_ORDER ="createorder";
	private static final String RAZORPAY_DO_PAYMENT_AND_PROCESS_ORDER ="processPaymentAndOrder";
	
	private static final String RAZORPAY_PROCESS_ORDER = "com.hcl.commerce.payments.razorpay.commands.HCLRazorPayProcessOrderCmd";
	
	@Override
	public String getResourceName() {
		return RESOURCE_NAME;
	}
			
	@POST
	@Path(RAZORPAY_CREATE_ORDER)
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@ResponseSchema(parameterGroup = RESOURCE_NAME, responseCodes = {
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 200, reason = "The requested completed successfully."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 400, reason = "Bad request. Some of the inputs provided to the request aren't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 401, reason = "Not authenticated. The user session isn't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 403, reason = "The user isn't authorized to perform the specified request."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 404, reason = "The specified resource couldn't be found."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 500, reason = "Internal server error. Additional details will be contained on the server logs.") })
	public Response createOrder(@PathParam("storeId") String storeId,
			@QueryParam(value = "responseFormat") String responseFormat) throws Exception {

		String METHODNAME = "createOrder";
		Response response = null;
		try{
		TypedProperty requestProperties = initializeRequestPropertiesFromRequestMap(responseFormat);
		
		if (responseFormat == null)
			responseFormat = "application/json";
		
	    response = executeControllerCommandWithContext(storeId, RAZORPAY_PROCESS_ORDER, requestProperties,responseFormat);
		}catch (Exception e){
			e.printStackTrace();
		 }

		return response;
	}
	
	@POST
	@Path(RAZORPAY_DO_PAYMENT_AND_PROCESS_ORDER)
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@ResponseSchema(parameterGroup = RESOURCE_NAME, responseCodes = {
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 200, reason = "The requested completed successfully."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 400, reason = "Bad request. Some of the inputs provided to the request aren't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 401, reason = "Not authenticated. The user session isn't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 403, reason = "The user isn't authorized to perform the specified request."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 404, reason = "The specified resource couldn't be found."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 500, reason = "Internal server error. Additional details will be contained on the server logs.") })
	public Response doPaymentAndProcessOrder(@PathParam("storeId") String storeId,
			@QueryParam(value = "responseFormat") String responseFormat) throws Exception {

		String METHODNAME = "doPaymentAndProcessOrder";
		Response response = null;
		try{
		TypedProperty requestProperties = initializeRequestPropertiesFromRequestMap(responseFormat);
		
		if (responseFormat == null)
			responseFormat = "application/json";
		
	    response = executeControllerCommandWithContext(storeId, RAZORPAY_PROCESS_ORDER, requestProperties,responseFormat);
		}catch (Exception e){
			e.printStackTrace();
		 }

		return response;
	}

}
