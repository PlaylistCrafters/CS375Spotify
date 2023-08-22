/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SERVER_PROTOCOL: process.env.SERVER_PROTOCOL,
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: process.env.SERVER_PORT,
    CLIENT_PROTOCOL: process.env.CLIENT_PROTOCOL,
    CLIENT_HOST: process.env.CLIENT_HOST,
    CLIENT_PORT: process.env.CLIENT_PORT,
  },
};

module.exports = nextConfig;
