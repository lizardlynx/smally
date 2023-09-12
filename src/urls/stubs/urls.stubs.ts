export const origUrl = 'https://docs.nestjs.com/techniques/database';
export const alias = 'abcdefghij';

export const urlsRedisStub = {
  [origUrl]: alias,
  [alias]: origUrl,
};

export const shortLink = `${process.env.APP_URL}/${alias}`;
