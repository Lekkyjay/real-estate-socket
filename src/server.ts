import { Server } from 'socket.io'

interface IUser {
  _id?: string
  userId: string
  socketId: string
}

const io = new Server({
  cors: { 
    origin: [process.env.CLIENT_URL_DEV as string, process.env.CLIENT_URL_PROD as string],
  }
})

let onlineUsers: IUser[] = []

const addUser = (userId: string, socketId: string) => {
  const userExits = onlineUsers.find((user) => user.userId == userId)
  if (!userExits) {
    onlineUsers.push({ userId, socketId })
  }
}

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId != socketId)
}

const getUser = (userId: string) => {
  return onlineUsers.find((user) => user.userId == userId)
}

io.on('connection', (socket) => {
  // console.log('a user connected with socketId:', socket.id)

  socket.on('newUser', (userId) => {
    // console.log('newUser event userId...:', userId)
    // console.log('newUser event socketId...:', socket.id)
    addUser(userId, socket.id)
    // console.log('onlineUsers....:', onlineUsers)
  })

  socket.on('sendMessage', ({ receiverId, data }) => {    //senderId never used. delete it!!! never sent from client
    // console.log('message sent from client....:', receiverId, data)
    // console.log('onlineUsers....:', onlineUsers)
    const receiver = getUser(receiverId)
    io.to(receiver?.socketId!).emit('gotMessage', { data })
  })

  //when disconnect
  socket.on('disconnect', () => {
    // console.log('a user disconnected!')
    removeUser(socket.id)
  })
})

const PORT = parseInt(process.env.PORT as string) || 8000
io.listen(PORT)