job "blockchain" {
  datacenters = ["dc1"]

  update {
    healthy_deadline  = "5m"
  }

  group "blockchain" {
    network {
      mode = "bridge"
      port "rpc" {}
      port "deployment_manager" {}
    }

    meta {
      mnemonic = "egg offer become stadium suspect world injury injury hungry divide goat banana"
      deployer_address = "0x27E53c11C8394793EaB687c7f896D1DeCe894ba3"
      deployer_private_key = "0x13a2f6287d22e311353054ff828a2efa2f511f6a2134135112fa9043979bba49"
    }

    service {
      name = "deployment-manager"
      port = "deployment_manager"

      connect {
        sidecar_service {}
      }
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
        memory = 600
        memory_max = 800
      }

      config {
        image = "trufflesuite/ganache-cli:v6.12.2"
        args = ["-p", "${NOMAD_HOST_PORT_rpc}", "-m", "${NOMAD_META_mnemonic}"]
        ports = ["rpc"]
      }
    }

    task "deployment-manager" {
      driver = "docker"

      resources {
        memory = 500
        memory_max = 1000
      }

      lifecycle {
        hook = "poststart"
        sidecar = true
      }

      service {
        check {
          type = "http"
          port = "deployment_manager"
          path = "/actuator/health"
          interval = "20s"
          timeout  = "5m"
        }
      }

      config {
        image = "gcr.io/alexis-de-la-torre/deployment-manager"
      }

      env {
        SERVER_PORT="${NOMAD_HOST_PORT_deployment_manager}"
      }
    }

    // Could this complete before deployment-manager is ready?
    task "bootstraper" {
      driver = "docker"

      resources {
        memory = 1500
      }

      lifecycle {
        hook = "poststart"
      }

      config {
        image = "gcr.io/alexis-de-la-torre/bootstraper"
      }

      env {
        GANACHE_PORT = "${NOMAD_HOST_PORT_rpc}"
        DEPLOYMENT_MANAGER_PORT = "${NOMAD_HOST_PORT_deployment_manager}"
        MNEMONIC = "${NOMAD_META_mnemonic}"
      }
    }
  }
}