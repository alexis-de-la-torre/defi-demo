job "bootstraper" {
  datacenters = ["dc1"]

  type = "batch"

  group "bootstraper" {
    network {
      mode = "bridge"
    }

    service {
      name = "bootstraper"

      connect {
        sidecar_service {
          proxy {
            upstreams {
              destination_name = "blockchain"
              local_bind_port = 8080
            }
          }
        }
      }
    }

    task "bootstraper" {
      driver = "docker"

      meta {
        version = "0.1.0-SNAPSHOT"
      }

      resources {
        cpu = 100
        memory = 600
        memory_max = 1200
      }

      config {
        image = "gcr.io/alexis-de-la-torre/bootstraper"
      }

      env {
        GANACHE_PORT = 8080
      }
    }
  }
}