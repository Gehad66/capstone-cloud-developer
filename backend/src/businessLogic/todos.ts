import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
export const getTodosForUser = async (userId: string) => {
    const logger = createLogger('getTodosForUser')
    try {
      let todos = await TodosAccess.getTodos(userId)
      logger.info('Getting todos for user ' + userId)
      return todos
    } catch (e) {
      logger.error('Could not get todos', { e })
      return createError(
        500,
        'A fatal unexpected error prevented us from getting Todos'
      )
    }
}
export const createTodo = async (userId: string, newTodo: CreateTodoRequest) => {
    const logger = createLogger('createTodo')

    if (newTodo.name == '') {
        logger.error('Todo name cant be empty')
        return createError(400, 'Todo name cant be empty')
    }

    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const attachmentUrl = `https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${todoId}`

    logger.info('Constructing the todo Item')
    const todoCreated: TodoItem = {
        userId,
        todoId,
        createdAt,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        done: false,
        attachmentUrl
    }

    await TodosAccess.createTodo(todoCreated)
    logger.info('Created todo', { todoCreated })
    return todoCreated as TodoItem
}

export const deleteTodo = async (userId: string, todoId: string) => {
    const logger = createLogger('deleteTodo')
    const deletionResult = await TodosAccess.deleteTodo(userId, todoId)
    logger.info('Deleted todo', { todoId })
    return deletionResult
}

export const updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest) => {
    const logger = createLogger('updateTodo')

    logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodo })
    const todo = await TodosAccess.updateTodo(userId, todoId, updatedTodo)
    logger.info('Updated todo', { todo })
    return todo
}

export const createAttachmentPresignedUrl = async (todoId: string) => {
    const logger = createLogger('createAttachmentPresignedUrl')
    const urlSigned = await AttachmentUtils.signUrl(todoId)
    logger.info('Created attachment presigned url', { urlSigned })
    return urlSigned
}

export const deleteAttachment = async (todoId: string) => {
    const logger = createLogger('deleteAttachment')
    const deletionResult = await AttachmentUtils.deleteAttachment(todoId)
    logger.info('Deleted attachment', { todoId })
    return deletionResult
}