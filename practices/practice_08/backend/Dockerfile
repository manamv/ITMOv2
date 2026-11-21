# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy project file and restore dependencies (layer cache optimization)
COPY ["LinguaType.Api.csproj", "./"]
RUN dotnet restore "LinguaType.Api.csproj"

# Copy source and publish
COPY . .
RUN dotnet publish "LinguaType.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

# Non-root user for security
USER $APP_UID

ENTRYPOINT ["dotnet", "LinguaType.Api.dll"]
