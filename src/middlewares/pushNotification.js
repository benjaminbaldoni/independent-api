const { Expo } = require('expo-server-sdk')

const { User, Post, Notification } = require('../models')

const expo = new Expo()

const templates = {
  NEW_COMMENT: userName => ({
    body: `${userName} commented one of your photos.`,
  }),
  NEW_FOLLOWER: userName => ({
    body: `${userName} subscribed to your content.`,
  }),
}

// TO.DO: Support send notifications to multiple users
const generateNotifications = async ({ type, targetUserId }) => {
  const { attributes: user } = await User.where({ id: targetUserId }).fetch()

  if (!Expo.isExpoPushToken(user.expoToken)) {
    console.error(`Push token ${user.expoToken} is not a valid Expo push token`)

    return false
  }

  const notification = {
    to: user.expoToken,
    sound: 'default',
    ...templates[type](user.profileName),
    data: {
      withSome: 'data',
    },
  }

  return [notification]
}

const sendNotifications = async (params) => {
  const notifications = await generateNotifications(params)

  const chunks = expo.chunkPushNotifications(notifications)
  const tickets = []

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk)

      tickets.push(...ticketChunk)
    } catch (error) {
      console.error(error)
    }
  }

  return tickets
}

// const handleReceipts = async (tickets) => {
//   const receiptIds = tickets.filter(ticket => ticket.id).map(ticket => ticket.id)

//   const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)

//   for (const chunk of receiptIdChunks) {
//     const receipts = await expo.getPushNotificationReceiptsAsync(chunk)

//     receipts.forEach(receipt => {
//       if (receipt.status === 'error') {
//         console.error(`There was an error sending a notification: ${receipt.message}`)

//         if (receipt.details && receipt.details.error) {
//           console.error(`The error code is ${receipt.details.error}`)
//         }
//       }
//     })
//   }
// }

const getTargetUsers = async (notificationType, body) => {
  switch (notificationType) {
    case 'NEW_COMMENT': {
      const { attributes: post } = await Post.where({ id: body.postId }).fetch()

      return post.userId
    }

    case 'NEW_FOLLOWER':
      return body.userId

    default:
      throw Error('Invalid notification type')
  }
}

module.exports = notificationType => (req, res, next) => {
  getTargetUsers(notificationType, req.body).then((targetUserId) => {
    const params = {
      userId: req.user.id,
      targetUserId,
      type: notificationType,
      ...req.body.postId && { postId: req.body.postId },
    }

    /* Avoid auto-nofitication */
    if (params.userId === params.targetUserId) {
      return
    }

    new Notification(params)
      .save()
      .then(() => {
        // sendNotifications(params)
        // Timeout is added for debugging purposes / remove on production
        setTimeout(() => {
          sendNotifications(params)
        }, 2000)
      })
  })

  return next()
}
