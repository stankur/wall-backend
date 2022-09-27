#!/bin/bash
aws --endpoint-url=http://localhost:4566 --no-sign-request s3 mb s3://localbucket
