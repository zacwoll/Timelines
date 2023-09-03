# Currently a list of commands to execute on the rabbitq server
# If you've come here because you've rebooted the rabbitmq server again, check for zombie processes

# Create a user for the API gateway

# create a user gateway for the gateway node
rabbitmqctl add_user gateway gateway
# set the user permissions on the virtual host (default is "/")
rabbitmqctl set_permissions gateway ".*" ".*" ".*"
# set the user tag on the gateway user
rabbitmqctl set_user_tags gateway ".*" ".*" ".*"

# create a user discord
rabbitmqctl add_user discord discord
rabbitmqctl set_permissions discord ".*" ".*" ".*"

# set the user tag on the discord user
rabbitmqctl set_user_tags discord ".*" ".*" ".*"



# Set the max_length_bytes policy to the max length of bytes for messages
# EX:  For example, if the maximum size of a Stream is set to "x-max-length-bytes":100000000, the Stream will discard the oldest messages when the Stream’s disk usage hits 100000000 bytes. RabbitMQ does not provide a default value for this.
# The unit could be in KB, MB, GB, or TB, however, when you just provide a value for this argument without a unit, it will default to bytes. 
rabbitmqctl set_policy max_length_bytes "^stream\." '{"max-length-bytes": 1000000}' --apply-to queues

# Set the max age of messages in the stream, uses units ""
rabbitmqctl set_policy max_age "^stream\." '{"max-age": 86400000}' --apply-to queues

# Set the max segment size of the stream
rabbitmqctl set_policy max_segment_size "^stream\." '{"stream-max-segment-size-bytes": 100000}' --apply-to queues