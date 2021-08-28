job "blockchain" {
  datacenters = ["dc1"]

  group "nomad" {
    network {
      mode = "bridge"

      port "blockchain" {}
    }

    service {
      name = "blockchain"
      port = "blockchain"
      tags = ["urlprefix-/blockchain"]

      check {
        type = "http"
        port = "blockchain"
        path = "/blockchain"
        method = "POST"
        header {
          Content-Type = ["application/json"]
        }
        body = "{\"method\": \"eth_blockNumber\", \"id\":1}"
        interval = "20s"
        timeout = "1m"
      }

      connect {
        sidecar_service {
          tags = [""]
        }
      }
    }

    task "blockchain" {
      driver = "docker"

      resources {
        cpu = 300
        memory = 400
        memory_max = 1000
      }

      config {
        image = "ethereum/client-go"
        args = [
          "--dev",
          "--http",
          "--http.addr", "0.0.0.0",
          "--http.rpcprefix", "/blockchain",
          "--http.port", "${NOMAD_HOST_PORT_blockchain}",
          "--http.vhosts", "*",
          "--http.corsdomain", "*",
          "--txpool.lifetime", "0h1m0s",
          "--http.api", "eth,net,web3,txpool,debug",
          "--verbosity", "5"
        ]
      }
    }
  }
}