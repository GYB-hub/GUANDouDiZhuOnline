from datetime import datetime

from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, SMALLINT

from models.base import Base


class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    openid = Column(String(50), unique=True)
    name = Column(String(50))
    sex = Column(SMALLINT)
    avatar = Column(String(256))
    date_joined = Column(TIMESTAMP, default=datetime.now)
    last_modified = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'uid': self.id,
            'name': self.name,
            'sex': self.sex,
            'avatar': self.avatar
        }


class Record(Base):
    __tablename__ = 'record'
    id = Column(Integer, primary_key=True)
    round = Column(Text, default='{}')
    robot = Column(SMALLINT, default=1)
    last_modified = Column(TIMESTAMP, default=datetime.now, onupdate=datetime.now)