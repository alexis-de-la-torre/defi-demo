job "blockchain-data-manager" {
  datacenters = ["dc1"]

  group "blockchain-data-manager" {
    network {
      mode = "bridge"

      port "blockchain_data_manager" {}
      port "database" {}
    }

    service {
      name = "blockchain-data-manager"
      port = "blockchain_data_manager"
      tags = ["urlprefix-/blockchain-data-manager"]

      check {
        type = "http"
        port = "blockchain_data_manager"
        path = "/blockchain-data-manager/actuator/health"
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

    task "blockchain-data-manager" {
      driver = "docker"

      resources {
        cpu = 50
        memory = 200
        memory_max = 800
      }

      config {
        image = "gcr.io/alexis-de-la-torre/blockchain-data-manager"
      }

      env {
        SERVER_PORT = "${NOMAD_HOST_PORT_blockchain_data_manager}"
        POSTGRES_URL = "jdbc:postgresql://localhost:${NOMAD_HOST_PORT_database}/postgres"
      }
    }

    task "bootstraper" {
      driver = "docker"

      lifecycle {
        hook = "poststart"
      }

      config {
        image = "gcr.io/alexis-de-la-torre/bootstraper"
      }

      env {
        DATA_MANAGER_ADDR = "http://localhost:${NOMAD_HOST_PORT_blockchain_data_manager}/blockchain-data-manager"
        BLOCKCHAIN_ADDR = "http://localhost:8545/blockchain"
      }
    }

    task "database" {
      driver = "docker"

      resources {
        cpu = 50
        memory = 50
        memory_max = 200
      }

      lifecycle {
        hook = "prestart"
        sidecar = true
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