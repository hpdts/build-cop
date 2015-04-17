require 'net/smtp'
require 'yaml'

properties = YAML.load_file('buildCop.yml')

$build_cop = ""
$from_address = properties['from_address']
$to_address =  properties['to_address']
$smtp_server =  properties['smtp_server']

f = File.open(properties['build_cop_file_name'], "r")
f.each_line do |line|
  puts line
  $build_cop = line
end
f.close

message = <<MESSAGE_END
From: #$from_address
To: #$to_address
Subject: Today's Build Cop

Hello everybody,

#$build_cop  is our Build Cop for today.

You have to look after our pipelines and you should try to fix our CI jobs. 
If you dont have the time for it. Notify the team so someone can take care of it.

Good luck making our builds happy.

Thanks,
Automation Squad.

MESSAGE_END

Net::SMTP.start($smtp_server) do |smtp|
  smtp.send_message message, $from_address, $to_address
end