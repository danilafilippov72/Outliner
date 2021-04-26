import sqlalchemy
from sqlalchemy.orm import sessionmaker

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base

"""engine = create_engine('sqlite:///:memory:', echo=True)"""
engine = create_engine('sqlite:///D:/Projects/Mine/Outl/2/src/scripts/Front-end/db/blogs.db', echo=True)

Base = declarative_base()

Base.metadata.create_all(bind=engine)

Session = sessionmaker()
Session.configure(bind=engine)
session = Session()

