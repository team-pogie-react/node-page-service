import requestIp from 'request-ip';
import _ from 'lodash';
import queryString from 'qs';
import Crypto from 'crypto';
import Validator from 'validatorjs';
import operationKeys from '../configs/services/operation-keys';
import urls from '../configs/services/urls';
import staticUri from '../configs/services/static-pages';
import staticForm from '../configs/services/static-forms';
import SeoApiService from './SeoApiService';
import ApiError from '../errors/classes/ApiError';
import timeouts from '../configs/timeouts';
import { makeHttpClientError } from '../errors/make';
import emailCfg from '../configs/services/emails';
import AccountTransformer from '../transformers/MyAccount/AccountsettingTransformer';

export default class StaticPages extends SeoApiService {
  /**
   * Create rating service.
   */
  constructor() {
    super();

    this.accountTransformer = new AccountTransformer();
  }

  /**
   * Get static page based on the URI
   * @param slug
   * @returns {Promise<any>}
   */
  getStaticPage(slug) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.SEO_CONTENTS,
        this._getStaticPagesQuery(slug),
        operationKeys.GET_CONTENTS,
        null,
      ).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Static Pages Query
   * @param slug
   * @returns {string|*}
   * @private
   */
  _getStaticPagesQuery(slug) {
    return queryString.stringify({
      source: 'object',
      path: `/${staticUri.CONFIG.baseUrl}/policies/${slug}`,
      apikey: process.env.API_GATEWAY_KEY,
    }, { encode: false });
  }

  _getSubscribeQuery(data) {
    const operation = operationKeys.SEND_EMAIL;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        to_email: data.email,
        event: 'site_subscribe',
        unsubscribed: 'false',
        SITECODE: 'carparts',
      }),
    }, { encode: true });
  }

  _sendContactUs(post, domain) {
    return new Promise((resolve, reject) => {
      if (typeof post.contact_name === 'undefined' || post.contact_name === '') {
        throw new Error('Contact name field required');
      }
      if (typeof post.contact_email === 'undefined' || post.contact_email === '') {
        throw new Error('Contact email field required');
      }
      if (typeof post.contact_department === 'undefined' || post.contact_department === '') {
        throw new Error('Department field required');
      }
      if (typeof post.contact_order === 'undefined' || post.contact_order === '') {
        throw new Error('Order field required');
      }
      if (typeof post.contact_message === 'undefined' || post.contact_message === '') {
        throw new Error('Message field required');
      }
      this._get(
        urls.EMAIL,
        this._sendContactUsQuery(post, domain),
        operationKeys.SEND_EMAIL,
        null,
      ).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  _sendFeedback(post, domain, request) {
    return new Promise((resolve, reject) => {
      if (typeof post.comment_topic === 'undefined' || post.comment_topic === '') {
        throw new Error('Topic field required');
      }
      if (typeof post.comment === 'undefined' || post.comment === '') {
        throw new Error('Comment field required');
      }
      if (typeof post.recommend === 'undefined' || post.recommend === '') {
        throw new Error('Recommend field required');
      }
      if (typeof post.email === 'undefined' || post.email === '') {
        throw new Error('Email field required');
      }
      this._get(
        urls.EMAIL_2,
        this._sendFeedbackQuery(post, domain, request),
        operationKeys.SEND_EMAIL,
        null,
      ).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  _sendContactUsQuery(post, domain) {
    const operation = operationKeys.SEND_EMAIL;
    const html = `
          <br><br>
                <b>CLIENT'S INFO</b><br>
                ----------------------------<br>
                <b>Name</b>         : ${post.contact_name}<br>
                <b>Email</b>        : ${post.contact_email}<br>
                <b>Department</b>   : ${post.contact_department}<br>
                <b>Order/Part #</b> : ${post.contact_order}<br>
                <br>
                <b>USER MESSAGE</b><br>
                ----------------------------<br>
                ${post.contact_message}<br>
                <br>
                <b>SOURCE INFO</b><br>
                ----------------------------<br>
                URL: <a href='${domain}'>${domain}</a><br>
    `;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        mailer: 'smtp',
        is_html: 1,
        enc: true,
        from_email: post.contact_email,
        from_text: post.contact_name,
        to_email: 'customerservice@carparts.com',
        subject: Buffer.from('Carparts - Email Us').toString('base64'),
        message: Buffer.from(html).toString('base64'),
      }),
    }, { encode: true });
  }

  _sendFeedbackQuery(post, domain, request) {
    const { headers } = request;
    const operation = operationKeys.SEND_EMAIL;
    const {
      email,
      comment,
    } = post;
    const ip = requestIp.getClientIp(request);
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, 0);
    const date = `${today.getDate() + 1}`.padStart(2, 0);
    const dateCreated = `${today.getFullYear()}${month}${date}${today.getHours()}${today.getMinutes()}${today.getSeconds()}`;

    const html = `
      <b>URL</b>
      <br>
      <br>
      <a href='https://${domain}/feedback'>https://${domain}/feedback</a>
      <br>
      <br>
      
      <hr>
      
      <br>
      <br>
      <b>PAGE COMMENTS</b>
      <br>
      <br><b>Category:</b> ${post.comment_topic} <br>
      <b>Comments:</b> ${comment}<br>
      <br>
      
      <hr>
      
      <br>
      <br>
      <b>QUESTIONS</b>
      <br>
      <br>  
      <b>Did you accomplish what you wanted to do on this page?</b> <span class="content-title">${post.isaccomplish !== '' ? 'Yes' : 'No'}</span>
      <br>
      <b>Would you recommend this site to a friend?</b> <span class="content-title">${post.recommend !== '' ? 'Yes' : 'No'}</span>
      <br>
      <b><span class="content-title">Email Address:</span></b> </span>${email}<br>
      <br>
      
      <hr>
      
      <br>
      <br>
      <b>BROWSER / SYSTEM INFO</b>
      <br>
      <br>
      <b>User Agent:</b> ${headers['user-agent']}
      <br>
      <b>Encoding:</b> ${headers['accept-encoding']}
      <br>
      <b>Language:</b> ${headers['accept-language']}
      <br>
      <b>Host:</b> ${headers.host}
      <br>
      <b>Origin:</b> ${headers.origin}
      <br>
      <b>Referer:</b> ${headers.referer}
      <br>
      <b>Content Type:</b> ${headers['content-type']}
      <br>
      <br>
      
      <hr>
      
      <br>
      <br>
      <b>REQUEST VALUES</b>
      <br>
      <br>
      ${JSON.stringify(post)}
      <br>
      <br>
      
      <hr>
      
      <br>
      <br>
      <b>SERVER INFO</b>
      <br>
      <br>
      <b>IP Address:</b> ${ip}
      <br>
      <br>
      <hr>
    `;
    const subject = Buffer.from(`[From CP-UPWA][Feedback] ${post.comment_topic} [${dateCreated}]`).toString('base64');

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        mailer: 'smtp',
        is_html: 1,
        enc: true,
        from_email: email,
        from_text: 'Carparts',
        to_email: 'feedback@carparts.com',
        subject: Buffer.from(subject).toString('base64'),
        message: encodeURI(Buffer.from(html).toString('base64')),
      }),
    }, { encode: true });
  }

  /**
   * _sendForgotEmail - Post reset password data
   *
   * @param {object} post
   *
   * @returns {Promise<Object>}
   */
  _sendForgotEmail(post) {
    return new Promise((resolve, reject) => {
      const validation = new Validator({
        email: post.forgotPwdEmail,
      }, { email: 'required|email' });

      if (validation.fails() === true) {
        return reject(new ApiError(validation.errors.first('email'), 422));
      }

      return this.getCustomerId(post).then((customerId) => {
        const resetAccount = Object.assign(post, {
          customerId: customerId.customer_id.toString(),
        });

        return this._get(
          urls.EMAIL_2,
          this._sendForgotEmailQuery(resetAccount),
          operationKeys.SEND_EMAIL,
          null,
          timeouts.MY_ACCOUNT,
        );
      }).then(result => resolve(result)).catch(error => reject(error));
    });
  }

  /**
   * getCustomerId - Gets customer id
   *
   * @param {object} post
   *
   * @returns {Promise<Object>}
   */
  getCustomerId(postData) {
    return new Promise((resolve, reject) => {
      const forgotpwdata = [];
      forgotpwdata.username = postData.forgotPwdEmail;
      forgotpwdata.domain = postData.domain;
      const qstring = queryString.stringify(forgotpwdata, { encode: false });
      const myaccoutUrl = urls.ACCOUNTS + operationKeys.GET_CUSTOMERID;

      this._getCustomerId(myaccoutUrl, qstring)
        .then(result => resolve(this.accountTransformer.customerId(result)))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * _getCustomerId
   *
   * @param {string} url
   * @param {string} query
   *
   * @returns {Promise<Object>}
   */
  _getCustomerId(url, query) {
    const timeout = timeouts.MY_ACCOUNT;
    const headers = { apiKey: process.env.API_GATEWAY_KEY };
    const reqUrl = this.securedUrl + url;

    return new Promise((resolve, reject) => {
      this.http.get(`${reqUrl}?${query}`, { headers, timeout })
        .then((result) => {
          const { data } = result;

          if (!data) {
            return reject(new ApiError('Invalid response', 500, 500));
          }

          return resolve(data);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * _sendForgotEmailQuery mail prep
   *
   * @param {string} post
   * @param {string} domaion
   *
   * @returns {string}
   */
  _sendForgotEmailQuery(post) {
    const operation = operationKeys.SEND_EMAIL;
    const {
      forgotPwdEmail,
      customerId,
      hostname,
      domain,
    } = post;

    const newDate = new Date(Date.now()).toUTCString();
    const referenceUrl = _.isEmpty(hostname) ? domain : hostname;
    const encCustomerId = Buffer.from(customerId).toString('base64');
    const encCustomerEmail = Buffer.from(forgotPwdEmail).toString('base64');
    const encTimestamp = Buffer.from(newDate).toString('base64');
    const site = emailCfg.SITE_NAME;
    const referrence = encodeURI(`https://${referenceUrl}/myaccount/login`);
    const borderCellwidth = 'border="0" cellspacing="0" cellpadding="0" width="100%"';
    const borderCell = 'border="0" cellspacing="0" cellpadding="0"';

    const str = `|${site}|${forgotPwdEmail}|${customerId}|${newDate}|${site}|`;
    const genCheckSum = Crypto.createHash('sha256').update(str).digest('hex');

    let textMessage = `You recently initiated a password reset for your ${site} account.`;
    textMessage += 'Please click on "Reset Password" below to enter a new password:';

    let tdStyle = 'background-color:#2196F3; border-radius: 5px !important; ';
    tdStyle += 'border: 1px; display: block; height: 50px;';

    let siteUrl = `https://${referenceUrl}/myaccount/resetpassword?u=${encCustomerId}`;
    siteUrl += `&t=${encTimestamp}&e=${encCustomerEmail}&r=${referrence}&c=${genCheckSum}&upwa=1`;

    let lowerMessage = 'If you dont want to change your password or didnt request this, ';
    lowerMessage += 'just ignore and delete this message.';

    let styleOne = 'padding:40px 5px 100px; font:16px Arial, sans-serif; ';
    styleOne += 'color:#222222; line-height:180%;';

    let hrefStyle = 'color:#FFF; display: block; border-radius: 5px;';
    hrefStyle += 'line-height: 50px !important; text-align:center; text-decoration:none; ';
    hrefStyle += 'font:18px bold Arial, sans-serif; -webkit-text-size-adjust:none; ';

    const html = `<table style="mso-table-lspace:0pt;mso-table-rspace:0pt;" ${borderCellwidth}>
          <tr>
            <td>
              <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;" ${borderCellwidth}>
                <tr>
                  <td>
                    <table ${borderCellwidth}>
                      <tr>
                        <td style="${styleOne}" align="left">${textMessage}<br /><br />
                            <table width="268" align="center" ${borderCell}>
                              <tr>
                                <td width="268" align="center" style="${tdStyle}">
                                  <a href="${siteUrl}" target="_blank" style="${hrefStyle}">
                                    Reset Password
                                  </a>
                                </td>
                              </tr>
                            </table><br />
                          ${lowerMessage}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `;

    const eSubj = Buffer.from(`${emailCfg.SITE_NAME}:Password Reset Request`).toString('base64');
    const eMessage = Buffer.from(html).toString('base64');

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        customer_username: forgotPwdEmail,
        domain_name: domain,
        referrer_url: referrence,
        customer_id: parseInt(customerId, 10),
        CustomerID: parseInt(customerId, 10),
        customer_email: forgotPwdEmail,
        is_html: 1,
        enc: true,
        from_email: emailCfg.CUSTOMER_SERVICE,
        reply_to: emailCfg.CUSTOMER_SERVICE,
        from_text: emailCfg.CUSTOMER_SERVICE,
        to_email: forgotPwdEmail,
        subject: eSubj,
        message: eMessage,
      }),
    }, { encode: true });
  }

  _subscribe(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.EMAIL_2,
        this._getSubscribeQuery(data),
        operationKeys.SEND_EMAIL,
        null,
      ).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  sendForm(data, domain, request) {
    // @TODO [Ron] Finish composite service for submit data.
    return new Promise((resolve, reject) => {
      const { type, post } = data;
      switch (type) {
        case staticForm.CONTACT_US.slug:
          this._sendContactUs(post, domain).then(() => {
            resolve({
              success: true,
              message: 'Successfully sent.',
            });
          }).catch(error => reject(new ApiError(error, 500, 500)));
          break;
        case staticForm.FORGOT_PASSWORD.slug:
          this._sendForgotEmail(post, domain).then(() => {
            resolve({
              success: true,
              message: 'Successfully sent.',
            });
          }).catch(error => reject(new ApiError(error, 500, 500)));
          break;
        case staticForm.PRICE_MATCH.slug:
          resolve({
            success: true,
            message: 'Successfully sent.',
          });
          break;
        case staticForm.FEEDBACK.slug:
          this._sendFeedback(post, domain, request).then(() => {
            resolve({
              success: true,
              message: 'Successfully sent.',
            });
          }).catch(error => reject(new ApiError(error, 500, 500)));
          break;
        case staticForm.SUBSCRIBE.slug:
          this._subscribe(post).then(() => {
            resolve({
              success: true,
              message: 'Successfully sent.',
            });
          });
          break;
        default:
          reject(new ApiError('Invalid Form', 404, 404));
          break;
      }
    });
  }

  /**
   * Parse URI
   * @param uri
   * @returns {*}
   */
  parseUri(uri) {
    return new Promise((resolve, reject) => {
      let data = uri;
      // Check if uri has trailing slash at the end.
      const lastChar = data.substr(-1);
      if (lastChar === '/') {
        // Remove trailing slash
        data = data.substring(0, data.length - 1);
      }
      switch (data) {
        case staticUri.COMPANY_ABOUT.uri:
          resolve(staticUri.COMPANY_ABOUT);
          break;
        case staticUri.CUSTOMER_CARPARTS_ON_EBAY.uri:
          resolve(staticUri.CUSTOMER_CARPARTS_ON_EBAY);
          break;
        case staticUri.COMPANY_LOW_PRICE_GUARANTEE.uri:
          resolve(staticUri.COMPANY_LOW_PRICE_GUARANTEE);
          break;
        case staticUri.CUSTOMER_ORDER_STATUS.uri:
          resolve(staticUri.CUSTOMER_ORDER_STATUS);
          break;
        case staticUri.CUSTOMER_PAYMENT_METHODS.uri:
          resolve(staticUri.CUSTOMER_PAYMENT_METHODS);
          break;
        case staticUri.CUSTOMER_HOW_TO_SHOP.uri:
          resolve(staticUri.CUSTOMER_HOW_TO_SHOP);
          break;
        case staticUri.CUSTOMER_RETURN_POLICY.uri:
          resolve(staticUri.CUSTOMER_RETURN_POLICY);
          break;
        case staticUri.CUSTOMER_POLICIES.uri:
          resolve(staticUri.CUSTOMER_POLICIES);
          break;
        case staticUri.CUSTOMER_WARRANTY_POLICY.uri:
          resolve(staticUri.CUSTOMER_WARRANTY_POLICY);
          break;
        case staticUri.FEEDBACK.uri:
          resolve(staticUri.FEEDBACK);
          break;
        case staticUri.CUSTOMER_SERVICE_EMAIL.uri:
          resolve(staticUri.CUSTOMER_SERVICE_EMAIL);
          break;
        case staticUri.BLOG_NEWS.uri:
          resolve(staticUri.BLOG_NEWS);
          break;
        case staticUri.COMPANY_AFFILIATE.uri:
          resolve(staticUri.COMPANY_AFFILIATE);
          break;
        case staticUri.RETRIEVE_QUOTE.uri:
          resolve(staticUri.RETRIEVE_QUOTE);
          break;
        case staticUri.CALIFORNIA_SUPPLY_CHAIN.uri:
          resolve(staticUri.CALIFORNIA_SUPPLY_CHAIN);
          break;
        case staticUri.EMAIL_OFFERS.uri:
          resolve(staticUri.EMAIL_OFFERS);
          break;
        case staticUri.SUBSCRIBE.uri:
          resolve(staticUri.SUBSCRIBE);
          break;
        case staticUri.TERMS_OF_USE.uri:
          resolve(staticUri.TERMS_OF_USE);
          break;
        case staticUri.PRIVACY_POLICY.uri:
          resolve(staticUri.PRIVACY_POLICY);
          break;
        default:
          reject(new ApiError('Invalid page URI', 400, 400));
      }
    });
  }
}
