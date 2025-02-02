import logging
from typing import Callable

backup_logger = logging.getLogger(__name__)


logger_callbacks = []


class ErrorLogger:

    @staticmethod
    def add_logging_callback(callback: Callable):
        """
        Adds a callback for logging purposes.
        :param callback: A function that takes in an exception
        """
        logger_callbacks.append(callback)

    @staticmethod
    def log_error(exception: Exception, message: str = None, logger: logging.Logger = backup_logger):
        """
        Logs an exception that occurs in the case that we can not throw an error.
        This will show the stack trace along with the exception.
        Uses a default logger if none is provided.
        :param exception: The exception that occured.
        :param message: An optional message.
        :param logger: A logger to use.  one is provided if nothing is used.
        :return:
        """
        if message is None:
            message = str(exception)
        logger.exception(message)
        try:
            for callback in logger_callbacks:
                callback(exception)
        except Exception as e:
            backup_logger.exception(e)
