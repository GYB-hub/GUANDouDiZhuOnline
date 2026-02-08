from sqlalchemy.engine import Result, ScalarResult
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import Select

__all__ = ('AlchemyMixin', 'Base')

from config import DATABASE_URI

Base = declarative_base()
engine = create_async_engine(DATABASE_URI, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """自动创建所有数据库表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


class AlchemyMixin:
    async def get_one_or_none(self, stmt: Select):
        async with self.session as session:
            async with session.begin():
                result: Result = await session.execute(stmt)
                return result.scalar_one_or_none()

    async def get_all(self, stmt: Select) -> ScalarResult:
        async with self.session as session:
            async with session.begin():
                result: Result = await session.execute(stmt)
                return result.scalars()

    async def insert(self, instance):
        async with self.session as session:
            async with session.begin():
                session.add(instance)
                await session.commit()

    @property
    def session(self) -> AsyncSession:
        return async_session()
