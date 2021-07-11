job "blockchain" {
  datacenters = ["dc1"]

  group "blockchain" {
    network {
      mode = "bridge"
      port "rpc" {}
    }

    service {
      name = "blockchain"
      tags = ["urlprefix-/blockchain"]
      port = "rpc"

      // TODO: Real health check (spring service with actuator?)
      check {
        name = "alive"
        type = "script"
        task = "blockchain"
        command = "/bin/sh"
        args = ["-c", "echo 0"]
        interval = "5s"
        timeout  = "10s"
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
        memory = 300
        memory_max = 600
      }

      config {
        image = "trufflesuite/ganache-cli:v6.12.2"
        args = ["-p", "${NOMAD_HOST_PORT_rpc}"]
        ports = ["rpc"]
      }
    }
  }
}