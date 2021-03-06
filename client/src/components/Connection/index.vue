<template>
  <div></div>
</template>

<script>
import socketIoClient from 'socket.io-client'
import { mapActions } from 'vuex'

export default {
  name: 'connection',
  computed: {
    server () {
      return this.$store.state.server
    },
    active () {
      return this.$store.state.project.active
    },
    preUser () {
      return this.$store.state.chat.preUser
    },
    preMessage () {
      return this.$store.state.chat.preMessage
    }
  },
  watch: {
    active: 'handleProject',
    preUser: 'handlePreUser',
    preMessage: 'handlePreMessage'
  },
  methods: {
    ...mapActions(['setServer', 'setConnect', 'setLoading']),
    ...mapActions('project', ['setProjects']),
    ...mapActions('files', ['setFiles', 'createFile', 'deleteFile', 'createVersion']),
    ...mapActions('chat', ['emptyMessages', 'updateUser', 'createMessage']),
    handleProject (data) {
      // 无效数据退出
      if (!data) {
        return
      }

      // reset files & messages
      this.setFiles([])
      this.emptyMessages()

      // reset connection to project
      if (this.projectSocket) {
        this.projectSocket.off('connect')
        this.projectSocket.off('update_project')
        this.projectSocket.off('create_file')
        this.projectSocket.off('delete_file')
        this.projectSocket.off('createVersion')
        this.projectSocket.disconnect()
      }

      this.setConnect(true)
      // build a new connection of project
      const projectUrl = `${this.server.domain}/project/${data.slug}`
      this.projectSocket = socketIoClient(projectUrl)

      this.projectSocket.on('connect', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WEB] - ' + `project ${data.slug} connected`)
        }

        this.setConnect(false)
      })

      this.projectSocket.on('update_project', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WEB] - ' + `project ${data.name} updated`)
        }

        this.setLoading(true)
        this.setFiles(data.files.files)
        this.setLoading(false)
      })

      this.projectSocket.on('create_file', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WEB] - ' + `${data.path.full} created`)
        }

        this.createFile(data)
      })

      this.projectSocket.on('delete_file', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WEB] - ' + `${data.path.full} deleted`)
        }

        this.deleteFile(data)
      })

      this.projectSocket.on('createVersion', (data) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[WEB] - ' + `${data.file} updated`)
        }

        this.createVersion(data)
      })

      // reset connection of chat
      if (this.chatSocket) {
        this.chatSocket.off('connect')
        this.chatSocket.off('user')
        this.chatSocket.off('message')
        this.projectSocket.disconnect()
      }

      const chatUrl = `${this.server.domain}/project/${data.slug}/chat`
      this.chatSocket = socketIoClient(chatUrl)

      this.chatSocket.on('connect', () => {
        console.log('[WEB] - ' + `project ${data.slug} chat connected`)
      })

      this.chatSocket.on('user', (data) => {
        this.updateUser(data)
      })

      this.chatSocket.on('message', (data) => {
        this.createMessage(data)
      })
    },
    handlePreUser (data) {
      data && this.chatSocket.emit('update_user', data)
    },
    handlePreMessage (data) {
      data && this.chatSocket.emit('message', data)
    }
  },
  created () {
    // 建立socket连接
    const projectsUrl = `${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4574'}/projects`
    this.projectsSocket = socketIoClient(projectsUrl)

    this.projectsSocket.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[WEB] - ' + 'projects connected')
      }
    })

    this.projectsSocket.on('config', (data) => {
      this.setServer(data)
    })

    this.projectsSocket.on('update_projects', (data) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[WEB] - ' + 'projects updated')
      }

      // 更新状态
      this.setProjects(data)
    })
  }
}
</script>
