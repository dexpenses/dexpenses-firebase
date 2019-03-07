#!/usr/bin/python3
import sys
import faker

fake = faker.Faker('de')

for _ in range(int(sys.argv[1])):
    print(getattr(fake, sys.argv[2])())
