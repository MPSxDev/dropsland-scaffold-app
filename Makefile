
NATIVE_TOKEN := $(shell stellar contract asset id --asset native --network testnet)

all: deploy-dj-fungible

build:
	stellar contract build

optimize: build
	stellar contract optimize --wasm target/wasm32v1-none/release/dj_fungible.wasm

deploy-dj-fungible:
	stellar contract deploy \
    	--wasm target/wasm32v1-none/release/dj_fungible.optimized.wasm \
		--source admin \
		--network testnet \
		--alias dj_fungible \
		-- \
		--admin admin \
        --manager admin \
		--decimals 7 \
		--name "DJ_FUNGIBLE" \
		--symbol "DJ_FUNGIBLE" \
        --initial_supply 10000000000

dj-fungible-create-order:
	stellar contract invoke \
		--source admin \
		--network testnet \
		--id dj_fungible \
		-- \
		create_order \
		--payment_token "$(NATIVE_TOKEN)" \
		--amount 10000000 \
		--price_per_token 1000000
