job "blockchain" {
  datacenters = ["dc1"]

  group "blockchain" {
    network {
      mode = "bridge"
      port "rpc" {}
    }

    service {
      name = "blockchain"
      port = "${NOMAD_HOST_PORT_rpc}"

      connect {
        sidecar_service {}
      }
    }

    task "blockchain" {
      driver = "docker"

      resources {
        memory = 300
        memory_max = 600
      }

      config {
        image = "trufflesuite/ganache-cli:v6.12.2"
        args = ["-p", "${NOMAD_HOST_PORT_rpc}"]
        ports = ["jrpc"]
      }
    }
  }
}