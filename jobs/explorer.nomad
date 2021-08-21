job "explorer" {
  datacenters = ["dc1"]

  group "explorer" {
    network {
      mode = "bridge"

      port "database" {}
      port "explorer" {}
    }

    service {
      name = "explorer"
      tags = ["urlprefix-/explorer strip=/explorer"]
      port = "explorer"

      check {
        type = "http"
        port = "explorer"
        path = "/"
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

    task "database" {
      driver = "docker"

      config {
        image = "postgres:12.5"
        args = ["-p", "${NOMAD_HOST_PORT_database}"]
      }

      env {
        POSTGRES_USER = "postgres"
        POSTGRES_PASSWORD = ""
        POSTGRES_HOST_AUTH_METHOD = "trust"
      }
    }

    task "explorer" {
      driver = "docker"

      config {
        image = "gcr.io/alexis-de-la-torre/explorer"
      }

      env {
        MIX_ENV= "prod"
        DATABASE_URL= "postgresql://postgres:@localhost:${NOMAD_HOST_PORT_database}/explorer?ssl=false"
        ETHEREUM_JSONRPC_VARIANT= "geth"
        ETHEREUM_JSONRPC_HTTP_URL= "localhost:8545/blockchain"
        NETWORK_PATH = "/explorer"
        SOCKET_ROOT = "/explorer"
        API_PATH = "/explorer"
        PORT = "${NOMAD_HOST_PORT_explorer}"
      }
    }
  }
}