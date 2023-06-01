<%--
 =================================================================
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
 =================================================================
--%>
<%-- 
  ***
  * This JSP shows all the required parameters for a payment using offline credit card.
  * It is meant to be used in the single page checkout.
  *
  * It is basically just asking for the payment amount and the billing address.
  ***
--%>

<!-- BEGIN StandardPayLater.jsp -->

<!-- Set the taglib -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://commerce.ibm.com/base" prefix="wcbase" %>
<%@ taglib uri="http://commerce.ibm.com/foundation" prefix="wcf" %>
<%@ taglib uri="flow.tld" prefix="flow" %>
<%@ include file="../../../Common/EnvironmentSetup.jspf" %>

<c:set var="paymentAreaNumber" value="${WCParam.currentPaymentArea}"/>
<c:if test="${empty paymentAreaNumber}">
	<c:set var="paymentAreaNumber" value="${param.paymentAreaNumber}" />
</c:if>
<c:set var="paymentTCId" value="${param.paymentTCId}"/>

<div class="card_info" id="WC_StandardPayLater_div_1_<c:out value='${paymentAreaNumber}'/>">

	<!-- The section to collect the protocol data for this payment method -->
	<input type="hidden" name="paymentTCId" value="<c:out value="${paymentTCId}"/>" id="WC_StandardPayLater_inputs_1_<c:out value='${paymentAreaNumber}'/>"/>
	<input type="hidden" id="mandatoryFields_<c:out value='${paymentAreaNumber}'/>" name="mandatoryFields"  value="billing_address_id"/>

	<span class="col1">

		
		<!-- ***************************
		* Start: Show the remaining amount -- the amount not yet allocated to a payment method
		*************************** -->
		
		<%@ include file="PaymentAmount.jspf"%>
	</span>
</div> 

<!-- <button id="rzp-button1">Pay</button> -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<!-- END StandardPayLater.jsp -->
