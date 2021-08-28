job "faucet" {
  datacenters = ["dc1"]

  group "faucet" {
    network {
      mode = "bridge"

      port "faucet" {}
    }

    service {
      name = "faucet"
      port = "faucet"
      tags = ["urlprefix-/faucet"]

      check {
        type = "http"
        port = "faucet"
        path = "/faucet/health"
        interval = "10s"
        timeout = "1m"
      }

      connect {
        sidecar_service {
          tags = [""]

          proxy {
            upstreams {
              destination_name = "blockchain"
              local_bind_port = 8545
            }
          }
        }
      }
    }

    task "faucet" {
      driver = "docker"

      config {
        image = "gcr.io/alexis-de-la-torre/faucet"
      }

      resources {
        memory = 200
      }

      env {
        PORT = "${NOMAD_HOST_PORT_faucet}"
      }
    }
  }
}