# This is a very loose guide on how to configure the infrastructure of the project
# TODO: Create Terraform job and do all this automatically

starting from a GCP vm with Ubuntu 20.0.1 Minimal

install dependencies:
sudo apt update
sudo apt install software-properties-common nano

install nomad and consul:
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install nomad consul

# TODO: consul on production mode
add service units:
nano /etc/systemd/system/nomad.service
nano /etc/systemd/system/consul.service

# TODO: Consul configuration
add nomad config:
rm /etc/nomad.d/nomad.hcl
nano /etc/nomad.d/nomad.hcl

enable and start services:
systemctl enable nomad && systemctl enable consul
systemctl start nomad && systemctl start consul

install docker:
sudo apt-get install apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install docker-ce docker-ce-cli containerd.io

configure docker:
gcloud auth configure-docker

install CNI plugin (https://www.nomadproject.io/docs/integrations/consul-connect):
curl -L -o cni-plugins.tgz "https://github.com/containernetworking/plugins/releases/download/v0.9.0/cni-plugins-linux-$( [ $(uname -m) = aarch64 ] && echo arm64 || echo amd64)"-v0.9.0.tgz
sudo mkdir -p /opt/cni/bin
sudo tar -C /opt/cni/bin -xzf cni-plugins.tgz


=== NOTES ===

Memory usage:
213m - nothing
278m - nomad
298m - 300 - consul
625m - blockchain