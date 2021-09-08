import express, {Request, RequestHandler, Response} from 'express';
import {body, query, validationResult} from 'express-validator';
const regRouter:express.Router = express.Router();

regRouter
    .route('/single')
    .get(
        query('reg')
            .exists({checkFalsy: true})
            .withMessage('ERROR: <reg> parameter missing')
            .toInt()
            .isInt({min: 1, max: 512})
            // eslint-disable-next-line max-len
            .withMessage('ERROR: <reg> parameter must be numeric and in the range 1-512'),
        query('type')
            .exists({checkFalsy: true})
            .withMessage('ERROR: <type> parameter missing')
            .isIn(['int', 'float'])
            // eslint-disable-next-line max-len
            .withMessage('ERROR: unvalid <type> parameter value must be "int" or "float"'),
        extractMetadata)
    .put(
        query('reg')
            .exists({checkFalsy: true})
            .withMessage('ERROR: <reg> parameter missing')
            .toInt()
            .isInt({min: 1, max: 512})
            // eslint-disable-next-line max-len
            .withMessage('ERROR: <reg> parameter must be numeric and in the range 1-512'),
        query('type')
            .exists({checkFalsy: true})
            .withMessage('ERROR: <type> parameter missing')
            .isIn(['int', 'float'])
            // eslint-disable-next-line max-len
            .withMessage('ERROR: unvalid <type> parameter value must be "int" or "float"'),
        body('data')
            .exists()
            .withMessage('ERROR: <data> key missing on request body')
            .isNumeric()
            .withMessage('ERROR: <data> value must be numeric')
            .custom((value, {req})=>{
              if (value % 1 != 0 && <Record<string,any>>(req.query)type == 'int')
              {
                throw new Error(`ERROR: Incompatibility between request <type:${request.query.type}> and <data> value.`)
              }
            })
        extractMetadata,
        extractData,
    );

regRouter
    .use((request, response)=> {
      const errors = validationResult(request);
      if (errors.isEmpty()) {
        response
            .status(200)
            .json({status: 'SUCCESS',
              payload: response.locals.payload});
      } else {
        response
            .status(400)
            .send('Bad request\n'+JSON.stringify(errors.array()));
      }
    });


/**
     *
     * @param request
     * @param response
     * @param next
     */
function extractMetadata(
    request:Request,
    response:Response,
    next:()=>void,
) {
  const type = request.query.type;
  const reg = parseInt(<string>request.query.reg);

  response.locals.payload = {
    method: 'GET',
    service: 'GET_ATTR_SINGLE',
    class: type == 'int' ? 0x6b : 0x6c,
    instance: 1,
    attribute: reg,
  };
  next();
}

export default regRouter;
