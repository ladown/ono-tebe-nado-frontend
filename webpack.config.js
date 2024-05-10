import { platform } from 'os';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import Dotenv from 'dotenv-webpack';

import postcssPlugins from './postcss.config.js';

const normalizePath = (pathToNormalize) => {
	return platform() === 'win32' ? pathToNormalize.split('\\').join('/') : pathToNormalize;
};

const formattedDirname =
	platform() === 'win32' ? normalizePath(dirname(fileURLToPath(import.meta.url))) : dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
	entry: './src/index.ts',
	devtool: 'source-map',
	output: {
		path: path.resolve(formattedDirname, 'dist'),
	},
	devServer: {
		open: true,
		host: 'localhost',
		watchFiles: ['src/pages/*.html'],
		hot: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'src/pages/index.html',
		}),

		new MiniCssExtractPlugin(),

		new Dotenv(),
	],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				use: ['babel-loader', 'ts-loader'],
				exclude: ['/node_modules/'],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					stylesHandler,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: postcssPlugins,
							},
						},
					},
					'resolve-url-loader',
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							sassOptions: {
								includePaths: ['src/scss'],
							},
						},
					},
				],
			},
			{
				test: /\.css$/i,
				use: [
					stylesHandler,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: postcssPlugins,
							},
						},
					},
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},

			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
					keep_fnames: true,
				},
			}),
		],
	},
};

export default () => {
	if (isProduction) {
		config.mode = 'production';
	} else {
		config.mode = 'development';
	}
	return config;
};
