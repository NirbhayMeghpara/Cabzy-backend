function getWelcomeUserEmail(user) {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
        margin: 0;
        padding: 0;
        }
        table,
        td {
        border-collapse: collapse;
        }
        img {
        border: 0;
        height: auto;
        outline: none;
        text-decoration: none;
        }
        p {
        display: block;
        margin: 13px 0;
        }
      </style>
    </head>
    <body style="background-color: #f9f9f9">
      <div style="background-color: #f9f9f9">
        <div style="background: #f9f9f9; margin: 0px auto; max-width: 600px">
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="background: #f9f9f9; width: 100%"
            >
            <tbody>
              <tr>
                <td
                  style="
                  border-bottom: #333957 solid 5px;
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                  "
                  ></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="background: #fff; margin: 0px auto; max-width: 600px">
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="background: #fff; width: 100%"
            >
            <tbody>
              <tr>
                <td
                  style="
                  border: #dddddd solid 1px;
                  border-top: 0px;
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                  "
                  >
                  <div
                    style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: bottom;
                    width: 100%;
                    "
                    >
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="vertical-align: bottom"
                      width="100%"
                      >
                      <tr>
                        <td
                          align="center"
                          style="font-size: 0px; padding: 10px 25px; word-break: break-word"
                          >
                          <table
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="border-collapse: collapse; border-spacing: 0px"
                            >
                            <tbody>
                              <tr>
                                <td style="width: 150px">
                                  <img
                                    height="auto"
                                    src="https://raw.githubusercontent.com/NirbhayMeghpara/Cabzy/main/src/assets/images/brand.png"
                                    style="
                                    border: 0;
                                    display: block;
                                    outline: none;
                                    text-decoration: none;
                                    width: 100%;
                                    margin-left: -15px
                                    "
                                    />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="width: 100%">
                                  <img
                                    height="auto"
                                    src="https://raw.githubusercontent.com/NirbhayMeghpara/Cabzy/main/src/assets/images/greeting.png"
                                    style="
                                    border: 0;
                                    display: block;
                                    outline: none;
                                    text-decoration: none;
                                    width: 300px;
                                    margin: 0px auto 10px
                                    "
                                    />
                                </td>
                      </tr>
                      <tr>
                        <td
                          align="left"
                          style="font-size: 0px; padding: 10px 25px; word-break: break-word"
                          >
                          <div
                            style="
                            font-family: 'Helvetica Neue', Arial, sans-serif;
                            font-size: 16px;
                            line-height: 22px;
                            text-align: left;
                            color: #555;
                            "
                            >
                            Hello ${user.name}!<br /><br />
                            <p>We're thrilled to welcome you to Cabzy! Thank you for choosing us for your transportation needs.</p>
                            <p>Here are a few things you can do with Cabzy:</p>
                            <ul style="font-size: 13px; margin-left:-15px">
                              <li><strong>Effortless Booking:</strong> Easily book a cab with just a few clicks.</li>
                              <li><strong>Track Your Ride:</strong> Keep an eye on your cab's progress in real-time.</li>
                              <li><strong>Fare Estimates:</strong> Know the cost of your ride before you even start.</li>
                              <li><strong>Secure Payments:</strong> Pay with confidence through our secure platform.</li>
                            </ul>
                            <p>To get started, simply click the link below to log in to your account:</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="center"
                          style="
                          font-size: 0px;
                          padding: 10px 25px;
                          padding-top: 10px;
                          padding-bottom: 30px;
                          word-break: break-word;
                          "
                          >
                          <table
                            align="center"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                            style="border-collapse: separate; line-height: 100%"
                            >
                            <tr>
                              <td
                                align="center"
                                bgcolor="#2F67F6"
                                role="presentation"
                                style="
                                border: none;
                                border-radius: 3px;
                                color: #ffffff;
                                cursor: auto;
                                padding: 15px 25px;
                                "
                                valign="middle"
                                >
                                <p
                                  style="
                                  background: #2f67f6;
                                  color: #ffffff;
                                  font-family: 'Helvetica Neue', Arial, sans-serif;
                                  font-size: 15px;
                                  font-weight: normal;
                                  line-height: 120%;
                                  margin: 0;
                                  text-decoration: none;
                                  text-transform: none;
                                  "
                                  >
                                  Login to Your Account
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td
                          align="left"
                          style="font-size: 0px; padding: 10px 25px; word-break: break-word"
                          >
                          <div
                            style="
                            font-family: 'Helvetica Neue', Arial, sans-serif;
                            font-size: 14px;
                            line-height: 20px;
                            text-align: left;
                            color: #525252;
                            "
                            >
                            Best regards,<br /><br />
                            Jethalal Gada <br />CEO and Founder, <br> Cabzy<br />
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin: 0px auto; max-width: 600px">
          <table
            align="center"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="width: 100%"
            >
            <tbody>
              <tr>
                <td
                  style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                  vertical-align: top;
                  "
                  >
                  <div
                    style="
                    font-size: 13px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: bottom;
                    width: 100%;
                    "
                    >
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                      <tbody>
                        <tr>
                          <td style="vertical-align: bottom; padding: 0">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              width="100%"
                              >
                              <tr>
                                <td
                                  align="center"
                                  style="font-size: 0px; padding: 0; word-break: break-word"
                                  >
                                  <div
                                    style="
                                    font-family: 'Helvetica Neue', Arial, sans-serif;
                                    font-size: 12px;
                                    font-weight: 300;
                                    line-height: 1;
                                    text-align: center;
                                    color: #575757;
                                    "
                                    >
                                    Cabzy Ltd, 35 Avenue. City 10115, USA
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td
                                  align="center"
                                  style="font-size: 0px; padding: 10px; word-break: break-word"
                                  >
                                  <div
                                    style="
                                    font-family: 'Helvetica Neue', Arial, sans-serif;
                                    font-size: 12px;
                                    font-weight: 300;
                                    line-height: 1;
                                    text-align: center;
                                    color: #575757;
                                    "
                                    >
                                    <a href="" style="color: #575757">Unsubscribe</a> from our emails
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </body>
  </html>
  `

  return html
}

module.exports = { getWelcomeUserEmail }