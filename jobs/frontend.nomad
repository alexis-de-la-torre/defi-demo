job "frontend" {
  datacenters = ["dc1"]

  group "frontend" {
    network {
      mode = "bridge"

      port "frontend" {}
    }

    service {
      name = "frontend"
      tags = ["urlprefix-/defi-demo"]
      port = "frontend"

      check {
        type = "http"
        port = "frontend"
        path = "/defi-demo"
        interval = "10s"
        timeout = "1m"
      }
    }

    task "frontend" {
      driver = "docker"

      config {
        image = "gcr.io/alexis-de-la-torre/frontend"
      }

      env {
        PORT = "${NOMAD_HOST_PORT_frontend}"
        BLOCKCHAIN_DATA_MANAGER_ADDR= "https://alexisdelatorre.com/blockchain-data-manager"
        FAUCET_ADDR= "https://alexisdelatorre.com/faucet"
      }
    }
  }
}