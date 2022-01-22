import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // Done: Implement creating a new TODO item
    const userId = getUserId(event);

    const createdTodo = await createTodo(userId, newTodo)

    if (createdTodo)
      return {
            statusCode: 201,
            body: JSON.stringify({
              item: createdTodo
            })
          };
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Item not created"
      })
    };
  }
)

handler.use(
  cors({
    credentials: true
  })
)
