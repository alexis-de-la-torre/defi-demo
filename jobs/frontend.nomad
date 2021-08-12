job "frontend" {
  datacenters = ["dc1"]

  group "frontend" {
    network {
      mode = "bridge"
      port "http" {}
    }

    service {
      name = "frontend"
      tags = ["urlprefix-/crypto-soccer"]
      port = "http"

      check {
        type = "http"
        port = "http"
        path = "/crypto-soccer"
        interval = "20s"
        timeout  = "5m"
      }

      connect {
        sidecar_service {
          tags = [""]

          proxy {
            upstreams {
              destination_name = "deployment-manager"
              local_bind_port = 8080
            }
            upstreams {
              destination_name = "blockchain"
              local_bind_port = 8545
            }
          }
        }
      }
    }

    task "frontend" {
      driver = "docker"

      config {
        image = "gcr.io/alexis-de-la-torre/frontend"
      }

      env {
        PORT = "${NOMAD_HOST_PORT_http}"
        BLOCKCHAIN_URL = "https://alexisdelatorre.com/blockchain"
      }
    }
  }
}