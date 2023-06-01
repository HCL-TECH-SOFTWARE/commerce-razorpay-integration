insert into policy (POLICY_ID,POLICYNAME,POLICYTYPE_ID,STOREENT_ID,PROPERTIES) values((SELECT MAX(Policy_Id)+1 from policy),'RZ-PAY','Payment',<storeId>,'attrPageName=RZ-PAY&paymentConfigurationId=default&display=true&compatibleMode=false&uniqueKey=tran_id');

insert into policydesc values((select policy_id from policy where policyname='RZ-PAY' and storeent_id=<storeId>),<langId>,'Razor Pay payment gateway','Razor Pay Payment Gateway',CURRENT TIMESTAMP,CURRENT TIMESTAMP,0);

insert into POLICYCMD (POLICY_ID,BUSINESSCMDCLASS) values((select policy_id from policy where policyname='RZ-PAY' and storeent_id=<storeId>),'com.ibm.commerce.payment.actions.commands.DoPaymentActionsPolicyCmdImpl');
insert into POLICYCMD (POLICY_ID,BUSINESSCMDCLASS) values((select policy_id from policy where policyname='RZ-PAY' and storeent_id=<storeId>),'com.ibm.commerce.payment.actions.commands.EditPaymentInstructionPolicyCmdImpl');
insert into POLICYCMD (POLICY_ID,BUSINESSCMDCLASS) values((select policy_id from policy where policyname='RZ-PAY' and storeent_id=<storeId>),'com.ibm.commerce.payment.actions.commands.QueryPaymentsInfoPolicyCmdImpl');


INSERT INTO STORECONF(STOREENT_ID,NAME,VALUE) VALUES(0,'RAZORPAY_KEY',<RAZORPAY_KEY>)
INSERT INTO STORECONF(STOREENT_ID,NAME,VALUE) VALUES(0,'RAZORPAY_SECRET',<RAZORPAY_SECRET>)
