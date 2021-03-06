import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import FileTree from '@/components/FileTree'
import Loading from '@/components/Loading'
import Folder from '@/components/FileTree/Folder'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('FileTree', () => {
  let modules, getters
  let store

  beforeEach(() => {
    modules = {
      files: {
        namespaced: true,
        getters: {
          tree: () => {
            return {
              filesCount: 0,
              folders: []
            }
          }
        }
      }
    }

    getters = {
      isLoading: () => false
    }

    store = new Vuex.Store({
      modules,
      getters
    })
  })

  it('no-loading', () => {
    const wrapper = shallowMount(FileTree, { store, localVue })

    expect(wrapper.findAll(Loading).length).to.equal(0)
  })

  it('no-content', () => {
    const wrapper = shallowMount(FileTree, { store, localVue })

    expect(wrapper.find('.file-empty')).to.exist
    expect(wrapper.findAll('.file-container').length).to.equal(0)
  })
})

describe('FileTree', () => {
  let modules, getters
  let store

  beforeEach(() => {
    modules = {
      files: {
        namespaced: true,
        getters: {
          tree: () => {
            return {
              filesCount: 5,
              folders: []
            }
          }
        }
      }
    }

    getters = {
      isLoading: () => true
    }

    store = new Vuex.Store({
      modules,
      getters
    })
  })

  it('has-loading', () => {
    const wrapper = shallowMount(FileTree, { store, localVue })

    expect(wrapper.findAll(Loading).length).to.equal(1)
  })

  it('has-content', () => {
    const wrapper = shallowMount(FileTree, { store, localVue })

    expect(wrapper.findAll('.file-empty').length).to.equal(0)
    expect(wrapper.findAll(Folder).length).to.equal(modules.files.getters.tree().folders.length)
  })
})
