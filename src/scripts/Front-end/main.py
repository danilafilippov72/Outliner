from dbMainScript import Base, session, engine
from sqlalchemy import Column, Integer, String

class User(Base):
    __tablename__ = 'nodes'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    fullname = Column(String)
    nickname = Column(String)

    def __repr__(self):
        return "<User(name='%s', fullname='%s', nickname='%s')>" % (
            self.name, self.fullname, self.nickname)


def init_db():

    Base.metadata.create_all(bind=engine)

    ed_user = User(name='ed', fullname='Ed Jones', nickname='edsnickname')
    session.add(ed_user)


    session.commit()

    print("Initialized the db")


if __name__ == "__main__":
    init_db()
