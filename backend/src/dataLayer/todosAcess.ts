import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('TodosAccess')

// DONE: Implement the dataLayer logic

export const TodosAccess = {
    async getTodos(userId: string): Promise<TodoItem[]> {
      logger.info('Getting all todos for user', { userId })
      let dbDoc = new DocumentClient({ service: new AWS.DynamoDB() })
      AWSXRay.captureAWSClient((dbDoc as any).service)
      const queryResult = await dbDoc
        .query({
          TableName: process.env.TODOS_TABLE,
          KeyConditionExpression: 'userId = :userId',
          IndexName: process.env.TODOS_BY_USER_INDEX,
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
      const items = queryResult.Items
      return items as TodoItem[]
    },
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      let dbDoc = new DocumentClient({ service: new AWS.DynamoDB() })
      AWSXRay.captureAWSClient((dbDoc as any).service)
      const queryResult = await dbDoc
        .put({
          TableName: process.env.TODOS_TABLE,
          Item: todo
        })
        .promise()
      return queryResult.Attributes as TodoItem
    },
  
    async updateTodo(
      userId: string,
      todoId: string,
      todoUpdate: TodoUpdate
    ): Promise<TodoItem> {
      let dbDoc = new DocumentClient({ service: new AWS.DynamoDB() })
      AWSXRay.captureAWSClient((dbDoc as any).service)
      const queryResult = await dbDoc
        .update({
          TableName: process.env.TODOS_TABLE,
          Key: {
            userId,
            todoId
          },
          UpdateExpression: 'set #N = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeNames: {
            '#N': 'name'
          },
          ExpressionAttributeValues: {
            ':name': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done
          }
        })
        .promise()
      return queryResult.Attributes as TodoItem
    },
  
    async deleteTodo(userId: string, todoId: string): Promise<string> {
      let dbDoc = new DocumentClient({ service: new AWS.DynamoDB() })
      AWSXRay.captureAWSClient((dbDoc as any).service)
      await dbDoc
        .delete({
          TableName: process.env.TODOS_TABLE,
          Key: {
            userId,
            todoId
          }
        })
        .promise()
      return todoId as string
    }
}