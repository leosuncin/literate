import { NOT_FOUND } from 'http-status-codes';
import { connectDB, validateMethod } from 'middlewares';
import { Article } from 'models';
import { NextHttpHandler } from 'types';

const showArticleHandler: NextHttpHandler = async (req, res) => {
  const article = await Article.findOne({ slug: req.query.slug }).populate(
    'author',
  );

  if (!article)
    res.status(NOT_FOUND).json({
      statusCode: NOT_FOUND,
      message: `Not found any article with slug: ${req.query.slug}`,
    });
  else res.json(article.toJSON());
};

export default validateMethod('GET', connectDB(showArticleHandler));
