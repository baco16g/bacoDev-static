import config from './config';
import path from 'path';
import webpack from 'webpack';

export default {
	devtool: '',
	entry: [
		path.join(__dirname, `${config.tasks.babel.src}`),
	],
	output: {
		path: path.join(__dirname, config.tasks.babel.dest),
		filename: config.tasks.babel.filename,
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
			},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
		}),
	],
	externals: {
		jquery: 'window.jQuery',
	},
};
