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

package com.hcl.commerce.payments.razorpay.utils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Hex;

import com.razorpay.RazorpayException;

/**
* This class defines common routines for generating
* authentication signatures for Razorpay Webhook requests.
*/
public class Signature
{
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    /**
    * Computes RFC 2104-compliant HMAC signature.
    * * @param data
    * The data to be signed.
    * @param key
    * The signing key.
    * @return
    * The Base64-encoded RFC 2104-compliant HMAC signature.
    * @throws
    * java.security.SignatureException when signature generation fails
    */
	public static String getHash(String payload, String secret) throws RazorpayException {
		Mac sha256_HMAC;
		try {
			sha256_HMAC = Mac.getInstance("HmacSHA256");
			SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256");
			sha256_HMAC.init(secret_key);
			byte[] hash = sha256_HMAC.doFinal(payload.getBytes());
			return new String(Hex.encodeHex(hash));
		} catch (Exception e) {
			throw new RazorpayException(e.getMessage());
		}
	}

	public static boolean verifySignature(String payload, String expectedSignature, String secret)
			throws RazorpayException {
		String actualSignature = getHash(payload, secret);
		return isEqual(actualSignature.getBytes(), expectedSignature.getBytes());
	}
    /**
     * We are not using String.equals() method because of security issue mentioned in
     * <a href="http://security.stackexchange.com/a/83670">StackOverflow</a>
     * 
     * @param a
     * @param b
     * @return boolean
     */
    private static boolean isEqual(byte[] a, byte[] b) {
      if (a.length != b.length) {
        return false;
      }
      int result = 0;
      for (int i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
      }
      return result == 0;
    }
}