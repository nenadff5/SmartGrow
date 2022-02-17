using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrow.Function {

    internal class Constants {
        
        public static readonly string AUTHENTICATION_HEADER_NAME = "Authorization";
        public static readonly string TOKEN_TYPE = "Bearer";
        public static readonly string HTML1 = "<p style=\"color: #000000; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;\">Hello,</p><p style = \"color: #000000; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;\" >Your code for password reset is:</p><div><span style = \"box-sizing:border-box;color:#24292e!important;display:inline-block;background-color:#eaf5ff;border-radius:6px;padding:2px 6px;font:300 48px &quot;SFMono-Regular&quot;,Consolas,&quot;Liberation Mono&quot;,Menlo,monospace\">";
        public static readonly string HTML2 = "</span></div><p style=\"color: #000000; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;\">Yours sincerely,<br> Smart Grow. <div style= \"color: #333333; font-size: 14px; font-family: 'Work Sans', Calibri, sans-serif; font-weight: 600; mso-line-height-rule: exactly; line-height: 23px;\"><br></p>For any questions, email us: <br><a href = \"mailto: \" style= \"color: #888888; font-size: 14px; font-family: 'Hind Siliguri', Calibri, Sans-serif; font-weight: 400; \"> smart.grow.mail@protonmail.com</a> </div>";
    }
}