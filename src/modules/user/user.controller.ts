import {
  ArgumentsHost,
  Catch,
  Controller,
  Inject,
  RpcExceptionFilter,
  UseFilters,
} from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import {
  CreateUserResponse,
  FindAllResponse,
  FindOneResponse,
  UpdateUserRequest,
  USER_SERVICE_NAME,
} from '../../protos/user.pb';
import { CreateUserRequestDto, UpdateUserProfileDto } from './dto';
import { FindOneRequestDto } from './dto/find-one-user.request.dto';
import { UserService } from './user.service';
import { DeleteUserRequestDto } from './dto/delete-user.request.dto';

@Catch(RpcException)
export class GrpcExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): any {
    return throwError(() => exception.getError());
  }
}

@UseFilters(GrpcExceptionFilter)
@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @GrpcMethod(USER_SERVICE_NAME, 'CreateUser')
  private async createUser(
    payload: CreateUserRequestDto,
  ): Promise<CreateUserResponse> {
    return this.service.create(payload);
  }

  @GrpcMethod(USER_SERVICE_NAME, 'FindOne')
  private async findOne(payload: FindOneRequestDto): Promise<FindOneResponse> {
    if (payload.email) {
      return this.service.findByEmail(payload);
    }
    if (payload.id) {
      return this.service.findById(payload);
    }
  }

  @GrpcMethod(USER_SERVICE_NAME, 'FindAll')
  private async findAll(): Promise<FindAllResponse> {
    return this.service.findAll();
  }

  @GrpcMethod(USER_SERVICE_NAME, 'UpdateUser')
  private async updateUser(payload: UpdateUserRequest): Promise<void> {
    console.log('UpdateUser payload: ', payload);
    return this.service.updateProfile(payload);
  }

  @GrpcMethod(USER_SERVICE_NAME, 'DeleteUser')
  private async deleteUser(payload: DeleteUserRequestDto): Promise<void> {
    return this.service.delete(payload);
  }
}
