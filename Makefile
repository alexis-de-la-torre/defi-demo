all: blockchain explorer

clean:
	-nomad job stop -purge blockchain
	-nomad job stop -purge explorer
	-nomad system reconcile summaries

blockchain:
	@echo "» No building necessary for Blockchain"
	@echo "» Deploying Blockchain"
	nomad job run jobs/blockchain.nomad

explorer:
	@echo "» Building Explorer"
	docker build -t gcr.io/alexis-de-la-torre/explorer components/explorer
	docker push gcr.io/alexis-de-la-torre/explorer
	@echo "» Deploying Explorer"
	nomad job run jobs/explorer.nomad

.PHONY: all blockchain explorer
