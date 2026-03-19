#!/usr/bin/bash
cd "$(dirname "$0")"
/usr/bin/perl -MIO::Socket::INET -e '
use IO::Socket::INET;
my $srv = IO::Socket::INET->new(LocalPort=>8080,Listen=>10,ReuseAddr=>1) or die "Cannot bind: $!";
print "Serving on http://localhost:8080\n";
while (my $c = $srv->accept) {
  my $req = <$c>;
  my (undef,$path) = split / /, $req;
  $path =~ s/\?.*//;
  $path = "/index.html" if !$path || $path eq "/";
  my $file = "." . $path;
  if (-f $file) {
    open my $fh, "<:raw", $file or do { print $c "HTTP/1.1 500\r\n\r\n"; close $c; next; };
    local $/; my $body = <$fh>; close $fh;
    my $ct = "text/html; charset=utf-8";
    $ct = "application/javascript" if $file =~ /\.js$/;
    $ct = "text/css" if $file =~ /\.css$/;
    $ct = "image/png" if $file =~ /\.png$/;
    $ct = "image/jpeg" if $file =~ /\.jpe?g$/;
    print $c "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: " . length($body) . "\r\nAccess-Control-Allow-Origin: *\r\n\r\n$body";
  } else {
    print $c "HTTP/1.1 404 Not Found\r\n\r\n";
  }
  close $c;
}
'
