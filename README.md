# HCL Commerce and Razorpay Integration Asset

# WARRANTY & SUPPORT

HCL Software provides HCL Commerce open source assets “as-is” without obligation to support them nor warranties or any kind, either express or implied, including the warranty of title, non-infringement or non-interference, and the implied warranties and conditions of merchantability and fitness for a particular purpose. HCL Commerce open source assets are not covered under the HCL Commerce master license nor Support contracts.

If you have questions or encounter problems with an HCL Commerce open source asset, please open an issue in the asset's GitHub repository. For more information about GitHub issues, including creating an issue, please refer to GitHub Docs. The HCL Commerce Innovation Factory Team, who develops HCL Commerce open source assets, monitors GitHub issues and will do their best to address them.

# HCLC-Razorpay=PaymentGateway Integration
This assets provides integration from HCL Commerce to Razorpay Payment Gatway. Merchants can integrate Razorpay to their commerce website and empower customers with new payment system. 

We are using these Razorpay Rest services during the checkout flow-
1. Create order in Razorpay server.
2. Initiate the Checkout/payment process in Razorpay iFrame.
3. Verify the razorpay payment signature.

### Prerequisites:
1. Razorpay Merchant Account. Create Merchant account using below link.
https://easy.razorpay.com/onboarding/l1/signup?field=MobileNumber
2. Create shared secret key and API key. Below is the URL which provide steps to generate the key.
https://dashboard.razorpay.com/app/website-app-settings/api-keys

### Plugin_Configuration:
Please refer the document Razorpay_Plugin_Guide.docx to complete the Payment plugin changes.

# HCL Commerce Version compatibity
This asset has been tested with HCL Commerce v9.1.x with React storefronts.
