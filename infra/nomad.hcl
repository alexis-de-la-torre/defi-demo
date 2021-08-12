data_dir = "/opt/nomad/data"
bind_addr = "0.0.0.0"

server {
  enabled = true
  bootstrap_expect = 1
  default_scheduler_config {
    memory_oversubscription_enabled = true
  }
}

client {
  enabled = true
  servers = ["127.0.0.1:4646"]
}