Configuring the RabbitMQ server

The following plugins are enabled on the RabbitMQ server
Streams
etc

The server is set up as follows.
On the localhost of the machine ports 15672 and 5672 and 5551 are used for the management ui (if enabled), the amqp port, and the streams port respectively

**Create a user for your services**
We want to create a user for each of my services, so first we need to create the user for the API gateway.

**x-max-length-bytes:**

This argument sets the maximum size of the RabbitMQ Stream. When the Stream's total size reaches the specified value of `x-max-length-bytes`, RabbitMQ will delete segment files from the beginning of the Stream. The unit of the value could be in KB, MB, GB, or TB, but when only the value is provided without a unit, it defaults to bytes. RabbitMQ does not provide a default value for this argument.

**max-age:**

This argument controls the lifespan of messages in a RabbitMQ Stream. It specifies the duration after which segment files in the Stream will be discarded. The unit of time can be specified in years (Y), months (M), days (D), hours (H), minutes (M), or seconds (S). For example, setting `x-max-age` to `"30D"` means that segment files older than 30 days will be discarded. RabbitMQ does not provide a default value for this argument.

**x-stream-max-segment-size-bytes:**

This argument determines the size of each segment file in a RabbitMQ Stream. If not provided, the Stream will not know when to close the current segment file and create a new one, thereby invoking the retention policy. The value of `x-stream-max-segment-size-bytes` specifies the maximum size of each segment file. The default value set by RabbitMQ is 500000000 bytes.

When configuring retention strategies, the `x-stream-max-segment-size-bytes` argument is required alongside `x-max-length-bytes` and `max-age`. It ensures that the Stream knows when to close a segment file and trigger the retention policy based on the segment size.

Additionally, `x-max-length-bytes` and `x-max-age` arguments can be combined. In such cases, the Stream will discard messages when both conditions are true. For example, if `x-max-length-bytes` is set to 100 and `x-max-age` is set to "30D", the Stream will only discard segment files that have been in the Stream for more than 30 days when the Stream's disk usage reaches 100.

Please note that these retention strategies help manage the size and lifespan of messages in RabbitMQ Streams effectively.
