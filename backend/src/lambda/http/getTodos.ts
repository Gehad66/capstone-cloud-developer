import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { TodoItem } from '../../models/TodoItem'

// Done: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const jwtToken = getUserId(event)
    const todos = (await getTodosForUser(jwtToken)) as TodoItem[]
    if (todos)
      return {
        statusCode: 200,
        body: JSON.stringify({ items: todos }),
      };
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Item not found"
      })
    };
  })
handler.use(
  cors({
    credentials: true
  })
)
