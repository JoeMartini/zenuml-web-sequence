import CopyWebpackPlugin from 'copy-webpack-plugin';
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const webpack = require('webpack');

/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when working with config.
 **/
export default function(config, env, helpers) {
	const htmlWebpackPlugin = helpers.getPluginsByName(
		config,
		'HtmlWebpackPlugin'
	)[0];
	Object.assign(htmlWebpackPlugin.plugin.options.minify, {
		removeComments: false,
		collapseWhitespace: false
	});
	htmlWebpackPlugin.plugin.options.preload = false;
	htmlWebpackPlugin.plugin.options.favicon = false;

	if (env.isProd) {
		config.devtool = false; // disable sourcemaps

		config.plugins.push(
			new CommonsChunkPlugin({
				name: 'vendor',
				minChunks: ({ resource }) => /node_modules/.test(resource)
			})
		);

		const swPlugin = helpers.getPluginsByName(
			config,
			'SWPrecacheWebpackPlugin'
		)[0];
		config.plugins.splice(swPlugin.index, 1);

		const uglifyPlugin = helpers.getPluginsByName(config, 'UglifyJsPlugin')[0];
		config.plugins.splice(uglifyPlugin.index, 1);
	}

	//env.production might be boolean or string
	config.plugins.push(new webpack.DefinePlugin({__PRODUCTION__: env.production}));

	const paddleCheckoutUrl = env.production === true
		? 'https://pay.paddle.com/checkout/551167' //ZenUML Pro
		: 'https://pay.paddle.com/checkout/552378'; //Test Plan1
	config.plugins.push(new webpack.DefinePlugin({__PADDLE_CHECKOUT_URL__: JSON.stringify(paddleCheckoutUrl)}));
}
