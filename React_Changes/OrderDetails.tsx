/*
 *==================================================
 * Licensed Materials - Property of HCL Technologies
 *
 * HCL Commerce
 *
 * (C) Copyright HCL Technologies Limited 2020
 *
 *==================================================
 */
//Standard libraries
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Axios, { Canceler } from "axios";
import getDisplayName from "react-display-name";
import { useLocation, useNavigate } from "react-router";
import { get } from "lodash-es";
//Foundation libraries
import cartService from "../../../_foundation/apis/transaction/cart.service";
import paymentInstructionService from "../../../_foundation/apis/transaction/paymentInstruction.service";

//Custom libraries
import OrderDetailSubsection from "../order-detail-subsection/OrderDetailSubsection";
import { OrderShippingInfo } from "../order-shipping-info";
import { OrderBillingInfo } from "../order-billing-info";
import { OrderPaymentInfo } from "../order-payment-info";
import { OrderTotalSummary } from "../order-total-summary";
import { RecurringOrderInfo } from "../recurring-order-info";
import { OrderDiscountSummary } from "../order-discount-summary";
import RecurringOrderHistory from "../../pages/_sapphire/order/RecurringOrderHistory";
import { PurchaseOrderNumber } from "../purchase-order-number";
import { PaymentInfoList } from "../payment-info-list";
import { PAYMENT } from "../../../constants/order";
import { Y, EMPTY_STRING } from "../../../constants/common";
import storeUtil from "../../../utils/storeUtil";
import { SHIPMODE } from "../../../constants/order";
import { useCheckoutProfileReview } from "../../../_foundation/hooks/use-checkout-profile-review";
import { SELECTED_PROFILE } from "../../../_foundation/constants/common";
import OrderPickupInfo from "../order-pickup-info/order-pickup-info";
import * as ROUTES from ".././../../constants/routes";
//UI
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import {
  StyledPaper,
  StyledButton,
  StyledContainer,
  StyledGrid,
  StyledProgressPlaceholder,
  StyledTypography,
  StyledIconLabel,
} from "@hcl-commerce-store-sdk/react-component";
import ReccuringOrderIcon from "@material-ui/icons/Repeat";
import { Divider } from "@material-ui/core";
import { useSelector } from "react-redux";
import { cartSelector } from "../../../redux/selectors/order";

interface OrderDetailsProps {
  order: any;
  orderItems: any[];
  isRecurringOrder?: boolean;
  recurringOrderNumber?: string;
  orderSchedule?: string;
  orderScheduleDisplay?: string;
  startDateString?: string;
  nextDelivery?: string;
  handleHistoryClick?: (e?: any) => void;
  showRecurringHistoryLink?: boolean;
  backButtonFunction?: (e?: any) => void;
  submitButtonFunction?: (v1?: any, v2?: any) => void;
  submitButtonDisableFunction?: () => void;
  parentComponent?: string; //name of parent
  poNumber?: string;
}

/**
 * Order Details section
 * displays order item table, order total summary, shipping, billing and payment info for order or cart summary
 * @param props
 */
const OrderDetails: React.FC<OrderDetailsProps> = (props: any) => {
  const location: any = useLocation();
  const { profileList } = useCheckoutProfileReview(props);
  const cartDetails = useSelector(cartSelector);
  const arrayIdx = cartDetails?.paymentInstruction?.length > 1 ? cartDetails?.paymentInstruction?.length - 1 : 0;
  const selectedPaymentMethodId = cartDetails?.paymentInstruction?.[arrayIdx]?.payMethodId;
  const navigate = useNavigate();

  const [clicked, setClicked] = useState<boolean>(false);
  const widgetName = getDisplayName(OrderDetails);
  const isRecurringOrder = props.isRecurringOrder ? props.isRecurringOrder : false;
  const recurringOrderNumber = props.recurringOrderNumber ? props.recurringOrderNumber : null;
  const orderSchedule = props.orderSchedule ? props.orderSchedule : null;
  const nextDelivery = props.nextDelivery ? props.nextDelivery : null;
  const [cvv, setCvv] = useState<string>(EMPTY_STRING);
  const {
    order,
    orderItems,
    handleHistoryClick,
    showRecurringHistoryLink,
    startDateString,
    orderScheduleDisplay,
    backButtonFunction,
    submitButtonFunction,
    submitButtonDisableFunction,
    parentComponent,
  } = props;
  const selectedProfile = get(location, `state.${SELECTED_PROFILE}`);
  const paymentInstruction =
    selectedProfile && profileList.length > 0
      ? profileList
      : order
      ? order.paymentInstruction
        ? order.paymentInstruction
        : []
      : [];

  const shipAsComplete = order ? order.shipAsComplete : "";
  const recurringOrderProps = {
    recurringOrderNumber,
    orderSchedule,
    orderScheduleDisplay,
    startDateString,
    nextDelivery,
  };
  const hasDiscounts = order && order.adjustment ? true : false;

  const { t } = useTranslation();
  const theme = useTheme();
  const CancelToken = Axios.CancelToken;
  const cancels: Canceler[] = [];
  const sm = !useMediaQuery(theme.breakpoints.up("sm"));
  const fullWidth = sm ? { fullWidth: true } : {};

  const payloadBase: any = {
    widget: widgetName,
    cancelToken: new CancelToken(function executor(c) {
      cancels.push(c);
    }),
  };

  const resolvePONumber = () => {
    if (props.poNumber === undefined && order && order.buyerPONumber) {
      cartService
        .getBuyerPurchaseOrderDataBean({
          buyerPurchaseOrderId: order.buyerPONumber,
          ...payloadBase,
        })
        .then((r) => r.data)
        .then((d2) => {
          if (d2.resultList[0] && d2.resultList[0].purchaseOrderNumber) {
            setPONumber(d2.resultList[0].purchaseOrderNumber);
          }
        });
    }
  };

  const [poNumber, setPONumber] = useState<string>(props.poNumber);

  const updatePaymentInstructionAndSubmit = async () => {
    let deleted = true;
    setClicked(true);

    try {
      await paymentInstructionService.deleteAllPaymentInstructions({ ...payloadBase });
    } catch (e) {
      console.log("PI deletion failed due to %o", e);
      deleted = false;
      setClicked(false);
    }

    const p = {
      ...payloadBase,
      body: {
        piAmount: order.grandTotal,
        cc_cvc: cvv,
        valueFromProfileOrder: Y,
        ordProfileId: selectedProfile,
        payMethodId: paymentInstruction[0].paymentMethod,
        billing_address_id: paymentInstruction[0].billingInfo.billing_address_id,
      },
    };

    try {
      if (deleted) {
        const res = await paymentInstructionService.addPaymentInstruction(p);
        if (res?.status === 201) {
          submitButtonFunction(null, profileList);
        }
      }
    } catch (e) {
      console.log("couldn't update payment instruction");
      setClicked(false);
    }
  };

  const isValidCvv = () => {
    if (
      selectedProfile &&
      paymentInstruction[0]?.paymentMethod !== PAYMENT.paymentMethodName.cod &&
      !(storeUtil.isNumeric(cvv.trim()) && cvv.length === 3)
    ) {
      return false;
    }
    return true;
  };

  const openCheckout = async (order) => {
    const options: any = {
      key: order.key,
      amount: order.razorPayAmount,
      currency: order.razorPayCurrency,
      name: "HCL Commerce Payment - React Store",
      description: "HCL Commerce Payment from React Store",
      order_id: order.razorPayOrderId,
      handler: async function (response: any) {
        const razorPayOrderId = response.razorpay_order_id;
        const razorPaymentId = response.razorpay_payment_id;
        const razorPaymentSignature = response.razorpay_signature;
        const orderId = cartDetails.orderId;
        const action = "processPaymentAndOrder";

        const paymentInfo = await paymentInstructionService.createRazorPayOrder({
          ...payloadBase,
          body: {
            orderId,
            razorPayOrderId,
            razorPaymentId,
            razorPaymentSignature,
            action,
          },
        });

        await paymentInfo.data;

        const emailList: string[] = [];
        if (cartDetails.paymentInstruction) {
          cartDetails.paymentInstruction
            .filter(({ email1 }) => email1?.trim())
            .forEach(({ email1 }) => emailList.push(email1));
        }

        navigate(ROUTES.ORDER_CONFIRMATION, {
          state: {
            orderId: cartDetails.orderId,
            emailList: emailList,
          },
        });
      },
    };

    const rzp1 = new (window as any).Razorpay(options);
    rzp1.open();
  };
  const createRazorPayOrder = async () => {
    try {
      await cartService.preCheckout({ ...payloadBase });
      const orderId = cartDetails.orderId;
      const action = "createOrder";
      const orderInfo = await paymentInstructionService.createRazorPayOrder({
        ...payloadBase,
        body: { orderId, action },
      });
      const orderDetail = await orderInfo.data;
      const orderObj = JSON.parse(JSON.stringify(orderDetail));
      openCheckout(orderObj);
    } catch (e) {
      console.log("PI create razor pay order failed due to %o", e);
      setClicked(false);
    }
  };
  const submit = async () => {
    if (selectedPaymentMethodId === PAYMENT.paymentMethodName.razorpay) {
      createRazorPayOrder();
    } else {
      if (selectedProfile) {
        updatePaymentInstructionAndSubmit();
      } else {
        setClicked(true);
        try {
          submitButtonFunction();
        } catch (e) {
          setClicked(false);
        }
      }
    }
  };

  const isDisabled = () => clicked || !isValidCvv() || !submitButtonDisableFunction();

  const ReviewOrderBackButton = () => {
    return (
      <StyledButton
        testId={selectedProfile ? "order-details-back-cart" : "order-details-back"}
        onClick={backButtonFunction}
        color="secondary"
        {...fullWidth}>
        {selectedProfile ? t("OrderDetails.Actions.BackCart") : t("OrderDetails.Actions.Back")}
      </StyledButton>
    );
  };
  const Actions = () => (
    <StyledGrid container justifyContent="space-between" spacing={1} className="checkout-actions horizontal-padding-2">
      <StyledGrid item>{backButtonFunction && <ReviewOrderBackButton />}</StyledGrid>
      <StyledGrid item>
        {submitButtonFunction ? (
          <StyledButton
            testId={isRecurringOrder ? "order-details-next-recurring-order" : "order-details-next"}
            color="primary"
            disabled={isDisabled()}
            onClick={submit}
            className="button"
            fullWidth>
            {isRecurringOrder ? t("OrderDetails.Actions.NextRecurringOrder") : t("OrderDetails.Actions.Next")}
          </StyledButton>
        ) : null}
      </StyledGrid>
    </StyledGrid>
  );

  const BillingAndPaymentSection = () =>
    paymentInstruction.length === 1 ? (
      <StyledGrid container spacing={2}>
        <StyledGrid item md={4} xs={12}>
          <OrderBillingInfo billingInfo={selectedProfile ? paymentInstruction[0].billingInfo : paymentInstruction[0]} />
        </StyledGrid>
        <StyledGrid item md={4} xs={12}>
          <OrderPaymentInfo
            paymentInstruction={paymentInstruction[0]}
            {...(selectedProfile ? { cvv: cvv, setCvv: setCvv } : {})}
          />
        </StyledGrid>
      </StyledGrid>
    ) : (
      <PaymentInfoList selectedPaymentInfoList={paymentInstruction} readOnly={true} />
    );

  const paymentDetails = poNumber ? (
    <>
      <StyledGrid container spacing={2} className="bottom-margin-2">
        <StyledGrid item>
          <PurchaseOrderNumber poNumber={poNumber} />
        </StyledGrid>
      </StyledGrid>
      <BillingAndPaymentSection />
    </>
  ) : (
    <BillingAndPaymentSection />
  );

  useEffect(() => {
    resolvePONumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.buyerPONumber]);

  useEffect(() => {
    return () => {
      cancels.forEach((cancel) => cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledGrid container spacing={2}>
      {isRecurringOrder && !showRecurringHistoryLink && recurringOrderNumber && (
        <StyledGrid item xs={12}>
          <StyledPaper>
            <StyledContainer className="vertical-margin-2">
              <RecurringOrderHistory parentOrderId={recurringOrderNumber} />
            </StyledContainer>
          </StyledPaper>
        </StyledGrid>
      )}
      {(!isRecurringOrder || !!showRecurringHistoryLink || !recurringOrderNumber) && (
        <>
          {orderItems ? (
            <>
              {orderItems[0].shipModeCode === SHIPMODE.shipModeCode.PickUp ? (
                <OrderPickupInfo {...{ parentComponent, orderItems }} />
              ) : (
                <OrderShippingInfo
                  shippingInfo={{
                    orderItems,
                    shipAsComplete,
                    parentComponent,
                    paymentInstruction,
                  }}
                />
              )}
            </>
          ) : (
            <StyledGrid item xs={12}>
              <StyledPaper>
                <StyledContainer className="vertical-margin-2">
                  <StyledProgressPlaceholder className="vertical-padding-20" />
                </StyledContainer>
              </StyledPaper>
            </StyledGrid>
          )}
          <StyledGrid item xs={12}>
            {/* Payment section */}
            {orderItems && paymentInstruction ? (
              <OrderDetailSubsection
                heading={<StyledTypography variant="h4">{t("OrderDetails.Labels.PaymentDetails")}</StyledTypography>}
                details={paymentDetails}
              />
            ) : (
              <StyledProgressPlaceholder className="vertical-padding-20" />
            )}
          </StyledGrid>

          <StyledGrid item xs={12}>
            <StyledPaper>
              <StyledContainer className="vertical-margin-2">
                <StyledGrid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  className="horizontal-padding-2"
                  spacing={2}>
                  <StyledGrid item xs={12} md={5}>
                    <StyledTypography variant="h4">{t("OrderDetails.Labels.OrderSummary")}</StyledTypography>
                  </StyledGrid>
                  {isRecurringOrder && (
                    <>
                      <StyledGrid item xs={12} md={3}>
                        <StyledIconLabel
                          variant="h6"
                          icon={<ReccuringOrderIcon color="primary" />}
                          label={t("RecurringOrderInfo.Title")}
                        />
                      </StyledGrid>
                      <StyledGrid item xs={12} md={4} container spacing={1}>
                        <RecurringOrderInfo
                          {...recurringOrderProps}
                          showHistoryLink={!!showRecurringHistoryLink}
                          handleHistoryLinkClick={handleHistoryClick}
                        />
                      </StyledGrid>
                    </>
                  )}
                </StyledGrid>
              </StyledContainer>
              <Divider />
              <StyledContainer className="vertical-margin-2">
                <StyledGrid
                  container
                  display="flex"
                  direction="row"
                  alignItems="flex-start"
                  className="horizontal-padding-2"
                  {...(hasDiscounts && { justifyContent: "space-between" })}
                  spacing={2}>
                  {hasDiscounts && (
                    <StyledGrid item xs={12} md={4}>
                      <OrderDiscountSummary order={order} />
                    </StyledGrid>
                  )}
                  <StyledGrid item xs={12} md={4}>
                    <OrderTotalSummary order={order} />
                  </StyledGrid>
                </StyledGrid>
              </StyledContainer>
              {(backButtonFunction || submitButtonFunction) && (
                <>
                  <Divider />
                  <StyledContainer className="vertical-margin-2">
                    <Actions />
                  </StyledContainer>
                </>
              )}
            </StyledPaper>
          </StyledGrid>
        </>
      )}
    </StyledGrid>
  );
};

export { OrderDetails };
