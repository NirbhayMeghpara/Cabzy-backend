const FCM = require("fcm-node")
require("dotenv").config()

function sendToAndroid(devicePushToken, title, body) {
  try {
    const fcm = new FCM(process.env.FCM_SERVER_KEY)

    const message = {
      to: devicePushToken,
      notification: {
        title,
        body,
        sound: "default",
      },
      sound: "enabled",
    }

    fcm.send(message, (err, response) => {
      if (err) console.error("Error sending FCM notification:", err)
      else console.log("FCM Notification sent successfully:", response)
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = { sendToAndroid }
