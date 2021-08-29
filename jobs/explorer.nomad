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

    task "explorer" {
      driver = "docker"

      resources {
        cpu = 400
        memory = 200
        memory_max = 1000
      }

      config {
        image = "gcr.io/alexis-de-la-torre/explorer:1.0.0"
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

    task "database" {
      driver = "docker"

      lifecycle {
        hook = "prestart"
        sidecar = true
      }

      resources {
        cpu = 100
        memory = 100
        memory_max = 500
      }

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
  }
}