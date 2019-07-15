bootstrap:
	./node_modules/.bin/lerna bootstrap
	cd packages/mix-cli; \
	sh scripts/bootstrap.sh; \
	npm i

bootstrap-cn:
	cd packages/mix; \
	npm --registry=https://registry.npm.taobao.org i; \
	npm --registry=https://registry.npm.taobao.org i babel-core babel-loader \
	css-loader file-loader postcss postcss-loader html-loader html-webpack-plugin \
	json-loader style-loader postcss-loader url-loader webpack webpack-dev-server \
	cd ../mix-cli; \
	sh scripts/bootstrap.sh; \
	npm --registry=https://registry.npm.taobao.org i